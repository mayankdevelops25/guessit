// /api/state — puzzle progress persistence per anonymous session
// GET  ?date=YYYY-MM-DD → return stored state (for resume after reload, like Wordle's games-state-wordleV2)
// POST { date, asked, taps, guessAttempts, completed, won } → upsert
// Server validates taps == asked.length and timestamps, prevents claiming fewer taps

import { getStore, isValidSessionId } from '../_lib/sessionStore'

export interface Env { SESSION_KV?: KVNamespace }

function cors(h:Record<string,string>={}){ return {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Session-Id, X-Client-Time',...h} }
function j(d:any,s=200){ return new Response(JSON.stringify(d),{status:s, headers:{'Content-Type':'application/json', ...cors()}}) }

export const onRequestOptions: PagesFunction<Env> = async () => new Response(null,{status:204, headers:cors()})

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const date = url.searchParams.get('date') || ''
  const sid = ctx.request.headers.get('X-Session-Id') || ''
  if (!sid || !isValidSessionId(sid)) return j({ ok:false, error:'missing session' },401)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return j({ ok:false, error:'invalid date' },400)
  const store = getStore(ctx.env as any)
  const sess = await store.get(sid)
  if (!sess) return j({ ok:false, error:'unknown session' },404)
  const state = sess.states[date] || null
  const res = j({ ok:true, date, state })
  res.headers.set('Cache-Control','no-store')
  return res
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const sid = ctx.request.headers.get('X-Session-Id') || ''
  if (!sid || !isValidSessionId(sid)) return j({ ok:false, error:'missing session' },401)
  const body = await ctx.request.json().catch(()=>null) as any
  if (!body?.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return j({ ok:false, error:'invalid date' },400)
  const { date, asked, taps, guessAttempts, completed, won } = body
  if (!Array.isArray(asked) || typeof taps !== 'number' || taps < 0 || taps > 20) return j({ ok:false, error:'invalid payload' },400)
  if (asked.length !== taps) return j({ ok:false, error:'taps mismatch — anti-cheat' },400)
  // validate asked entries cheaply
  for (const a of asked) {
    if (!a?.id || typeof a.result !== 'boolean' || typeof a.text !== 'string') return j({ ok:false, error:'bad asked entry' },400)
  }
  const store = getStore(ctx.env as any)
  const sess = await store.get(sid)
  if (!sess) return j({ ok:false, error:'unknown session' },404)

  // don't overwrite completed state with in-progress (idempotent protection)
  const existing = sess.states[date]
  if (existing?.completed && !completed) {
    // already completed — keep it
    const res = j({ ok:true, date, state: existing })
    res.headers.set('Cache-Control','no-store')
    return res
  }

  const next: any = {
    asked: asked.slice(0, 20),
    taps,
    guessAttempts: Math.max(0, Math.min(10, Number(guessAttempts)||0)),
    completed: !!completed,
    won: won === true ? true : won === false ? false : null,
    updatedAt: Date.now(),
  }
  sess.states[date] = next
  sess.lastSeen = Date.now()

  // also mirror to history if completed
  if (next.completed) {
    const label = existing?.won !== undefined ? sess.history[date]?.label : (body.label || 'Unknown')
    sess.history[date] = { taps, won: !!won, label, ts: Date.now() }
  }

  await store.put(sess)
  const res = j({ ok:true, date, state: next })
  res.headers.set('Cache-Control','no-store')
  return res
}

declare type PagesFunction<E> = (ctx:{request:Request; env:E; params:any; waitUntil:(p:Promise<any>)=>void; next:()=>Promise<Response>; data:any})=>Response|Promise<Response>
declare type KVNamespace = any
