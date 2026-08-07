// GET /api/share?date=YYYY-MM-DD — returns server-signed share text
// Prevents spoofing taps claim (like Wordle's spoofable emoji grids, but verifiable)
// Token is HMAC-like via deterministic server hash (no secret needed at v1, but structure ready for secret)

import { getStore, isValidSessionId } from '../_lib/sessionStore'
import { puzzleNumber, getDailyCategory } from '../../src/lib/content'

export interface Env { SESSION_KV?: KVNamespace; SHARE_SECRET?: string }

function cors(h:Record<string,string>={}){ return {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Session-Id',...h} }
function j(d:any,s=200){ return new Response(JSON.stringify(d),{status:s, headers:{'Content-Type':'application/json', ...cors()}}) }

function simpleHash(s:string){
  let h=2166136261
  for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h,16777619) }
  return Math.abs(h).toString(36)
}

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
  const state = sess.states[date]
  if (!state || !state.completed) return j({ ok:false, error:'puzzle not completed' },400)

  const n = puzzleNumber(date)
  const grid = state.asked.map((a:any)=> a.result ? '🟩':'🟥').join('') || '—'
  const taps = state.taps
  const streak = sess.streak.count
  const catLabel = getDailyCategory(date).label
  const shareText = `Guess of the Day — Daily #${n} · ${catLabel}\nSolved in ${taps} taps ${taps<=3?'⚡️':taps<=5?'✨':''}\n${grid}\nStreak: ${streak} 🔥\nguessofday.game`
  const secret = (ctx.env as any)?.SHARE_SECRET || 'gotd-v1-secret'
  const token = simpleHash(`${sid}:${date}:${taps}:${secret}`)
  const res = j({ ok:true, shareText, token, taps, puzzleNo:n })
  res.headers.set('Cache-Control','no-store')
  return res
}

declare type PagesFunction<E> = (ctx:{request:Request; env:E; params:any; waitUntil:(p:Promise<any>)=>void; next:()=>Promise<Response>; data:any})=>Response|Promise<Response>
declare type KVNamespace = any
