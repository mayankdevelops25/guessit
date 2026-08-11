// POST /api/session — create or refresh anonymous session (no login)
// GET  /api/session — fetch current session info
// Wordle lesson: localStorage streak is spoofable -> server must be source of truth.
// This endpoint mirrors NYT's anonymous → authenticated upgrade path:
// - On first visit, client ensures a local UUID and POSTs here to mint server state
// - On later visits, server validates streak so editing localStorage can't fake it

import { getStore, newSession, isValidSessionId } from '../_lib/sessionStore'

export interface Env { SESSION_KV?: KVNamespace }

function cors(h: Record<string,string> = {}) { return { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Session-Id, X-Client-Time', ...h } }

function j(d:any, s=200, extra: Record<string,string>={}) {
  return new Response(JSON.stringify(d), { status:s, headers:{ 'Content-Type':'application/json', ...cors(extra) } })
}

export const onRequestOptions: PagesFunction<Env> = async () => new Response(null,{status:204, headers:cors()})

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const sid = ctx.request.headers.get('X-Session-Id') || ''
  const store = getStore(ctx.env as any)

  let id = sid && isValidSessionId(sid) ? sid : crypto.randomUUID()
  let sess = await store.get(id)
  let isNew = false
  if (!sess) {
    sess = newSession(id)
    isNew = true
  } else {
    sess.lastSeen = Date.now()
  }
  await store.put(sess)

  const res = j({ ok:true, session:{ id:sess.id, createdAt:sess.createdAt, lastSeen:sess.lastSeen, streak:sess.streak, historyCount:Object.keys(sess.history).length }, isNew })
  res.headers.set('Cache-Control','no-store')
  // also set cookie for future server-side reads if needed (not HttpOnly so JS can read fallback)
  res.headers.set('Set-Cookie', `gotd_sid=${sess.id}; Path=/; Max-Age=7776000; SameSite=Lax`)
  return res
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const sid = ctx.request.headers.get('X-Session-Id') || new URL(ctx.request.url).searchParams.get('sid') || ''
  if (!sid || !isValidSessionId(sid)) return j({ ok:false, error:'missing session' }, 401)
  const store = getStore(ctx.env as any)
  const sess = await store.get(sid)
  if (!sess) return j({ ok:false, error:'unknown session' }, 404)
  sess.lastSeen = Date.now()
  await store.put(sess)
  const res = j({ ok:true, session:{ id:sess.id, createdAt:sess.createdAt, lastSeen:sess.lastSeen, streak:sess.streak, historyCount:Object.keys(sess.history).length }, isNew:false })
  res.headers.set('Cache-Control','no-store')
  return res
}

declare type PagesFunction<E> = (ctx:{request:Request; env:E; params:any; waitUntil:(p:Promise<any>)=>void; next:()=>Promise<Response>; data:any})=>Response|Promise<Response>
declare type KVNamespace = any
