// Cloudflare Pages Function — POST /api/guess  { date, guessId }
// Server-authoritative guess validation + server-validated streak (Wordle flaw fix)
// Wordle's localStorage streak was editable; we make server the source of truth.

import { getDailyAnswer, getDailyCategory, toPublicCandidate } from '../../src/lib/content'
import { getStore, isValidSessionId, isConsecutive, isSameDay } from '../_lib/sessionStore'

export interface Env { SESSION_KV?: KVNamespace }

function j(d:any,s=200){ return new Response(JSON.stringify(d),{status:s, headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type, X-Session-Id'}}) }

export const onRequestOptions: PagesFunction<Env> = async () => new Response(null,{status:204, headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Session-Id'}})

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const body = await ctx.request.json().catch(()=>null) as { date?:string; guessId?:string } | null
  if (!body?.date || !body?.guessId) return j({ ok:false, error:'missing date or guessId' },400)
  const { date, guessId } = body
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return j({ ok:false, error:'invalid date' },400)

  const hidden = getDailyAnswer(date)
  const guessed = getDailyCategory(date).answers.find(a=>a.id===guessId)
  if (!guessed) return j({ ok:false, error:'unknown answer for this category' },404)

  const correct = hidden.id === guessId
  const sid = ctx.request.headers.get('X-Session-Id') || ''
  let streak: { count:number; lastDate:string|null } | undefined

  // if session present and correct, update streak server-side (source of truth)
  if (sid && isValidSessionId(sid)) {
    try {
      const store = getStore(ctx.env as any)
      const sess = await store.get(sid)
      if (sess) {
        // prevent double-counting same day
        const alreadyCompleted = sess.states[date]?.completed && sess.states[date]?.won === true
        if (correct && !alreadyCompleted) {
          // streak logic: Wordle-like with freeze forgiveness
          const last = sess.streak.lastDate
          if (last === date) {
            // already counted today — idempotent
          } else if (last && isSameDay(last, date)) {
            // same day repeat — no increment
          } else if (!last) {
            sess.streak = { count:1, lastDate: date, freezeAvailable: true }
          } else if (isConsecutive(last, date)) {
            sess.streak = { count: sess.streak.count + 1, lastDate: date, freezeAvailable: sess.streak.freezeAvailable }
          } else {
            // gap >1 day — check freeze
            const gapDays = (()=>{ const a=new Date(last+'T12:00:00').getTime(); const b=new Date(date+'T12:00:00').getTime(); return Math.round((b-a)/86400000) })()
            if (gapDays === 2 && sess.streak.freezeAvailable) {
              // forgive one missed day (streak freeze)
              sess.streak = { count: sess.streak.count + 1, lastDate: date, freezeAvailable: false }
            } else {
              sess.streak = { count:1, lastDate: date, freezeAvailable: true }
            }
          }
        } else if (!correct) {
          // wrong guess not completing — don't touch streak yet, but record attempt
        }

        // persist state + history
        const st = sess.states[date] || { asked:[], taps:0, guessAttempts:0, completed:false, won:null, updatedAt:Date.now() }
        st.guessAttempts = (st.guessAttempts||0)+1
        st.updatedAt = Date.now()
        if (correct) {
          st.completed = true
          st.won = true
          sess.history[date] = { taps: st.taps, won:true, label: hidden.label, ts: Date.now() }
          // if missed days and freeze not available, server already reset; client will sync
        } else {
          // if out of candidates and wrong, mark completed as loss? keep open so they can keep guessing
        }
        sess.states[date] = st as any
        sess.lastSeen = Date.now()
        await store.put(sess)
        streak = { count: sess.streak.count, lastDate: sess.streak.lastDate }
      }
    } catch {}
  }

  const payload:any = { ok:true, correct, guessId, attempts:1, streak }
  if (correct) payload.answer = toPublicCandidate(hidden)
  const res = j(payload)
  res.headers.set('Cache-Control','no-store')
  return res
}

declare type PagesFunction<E> = (ctx:{request:Request; env:E; params:any; waitUntil:(p:Promise<any>)=>void; next:()=>Promise<Response>; data:any})=>Response|Promise<Response>
declare type KVNamespace = any
