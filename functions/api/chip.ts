// Cloudflare Pages Function — POST /api/chip  { date, chipId }
// Returns YES/NO by checking hidden answer server-side (FR-4 + FR-10)
// Now session-aware: validates per-session progress, rate-limited per session, anti-cheat

import { getDailyAnswer, getDailyCategory } from '../../src/lib/content'
import { getStore, isValidSessionId } from '../_lib/sessionStore'

export interface Env { SESSION_KV?: KVNamespace }

const RATE = new Map<string, { count: number; reset: number }>()

function j(d:any,s=200, extra:Record<string,string>={}){ return new Response(JSON.stringify(d),{status:s, headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type, X-Session-Id', ...extra}}) }

export const onRequestOptions: PagesFunction<Env> = async () => new Response(null,{status:204, headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Session-Id'}})

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const body = await ctx.request.json().catch(()=>null) as { date?:string; chipId?:string } | null
  if (!body?.date || !body?.chipId) return j({ ok:false, error:'missing date or chipId' },400)
  const { date, chipId } = body
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return j({ ok:false, error:'invalid date' },400)

  const sid = ctx.request.headers.get('X-Session-Id') || ''
  // session optional for backward compat, but if present validate rate per session
  const ip = ctx.request.headers.get('CF-Connecting-IP') || ctx.request.headers.get('x-forwarded-for') || 'local'
  const rateKey = sid && isValidSessionId(sid) ? `sess:${sid}:${date}` : `ip:${ip}:${date}`
  const now = Date.now()
  const b = RATE.get(rateKey)
  if (b && b.reset > now && b.count > 80) return j({ ok:false, error:'rate limited — slow down', code:'rate_limited' },429)
  if (!b || b.reset < now) RATE.set(rateKey,{count:1, reset: now+60_000}); else b.count++

  // chips are category-scoped — reject chips that don't belong to today's category
  const chip = getDailyCategory(date).chips.find(c=>c.id===chipId)
  if (!chip) return j({ ok:false, error:'unknown chip for this category' },404)

  // check if puzzle already completed for this session — no more chips needed
  if (sid && isValidSessionId(sid)) {
    const store = getStore(ctx.env as any)
    const sess = await store.get(sid)
    if (sess?.states[date]?.completed) {
      return j({ ok:false, error:'puzzle already completed', code:'already_completed' },409)
    }
    // also prevent duplicate chip tap
    if (sess?.states[date]?.asked?.some((a:any)=>a.id===chipId)) {
      return j({ ok:false, error:'chip already asked', code:'duplicate_chip' },409)
    }
  }

  const hidden = getDailyAnswer(date)
  const result = chip.check(hidden)

  // update session state opportunistically (so state stays in sync even if client doesn't POST /state)
  if (sid && isValidSessionId(sid)) {
    try {
      const store = getStore(ctx.env as any)
      const sess = await store.get(sid)
      if (sess) {
        const st = sess.states[date] || { asked:[], taps:0, guessAttempts:0, completed:false, won:null, updatedAt:Date.now() }
        st.asked.push({ id:chipId, text:chip.text, result })
        st.taps = st.asked.length
        st.updatedAt = Date.now()
        sess.states[date] = st as any
        sess.lastSeen = Date.now()
        await store.put(sess)
      }
    } catch {}
  }

  const res = j({ ok:true, chipId, result, chipText: chip.text, remaining: -1 })
  res.headers.set('Cache-Control','no-store')
  return res
}

declare type PagesFunction<E> = (ctx:{request:Request; env:E; params:any; waitUntil:(p:Promise<any>)=>void; next:()=>Promise<Response>; data:any})=>Response|Promise<Response>
declare type KVNamespace = any
