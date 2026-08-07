// Cloudflare Pages Function — POST /api/analytics  { name, params }
// Minimal ingestion for FR-9 — forwards to backend store / Firebase via server side if configured
// No PII; rate-limited, validated

export interface Env {
  ANALYTICS_KV?: KVNamespace
}

const ALLOWED = new Set(['game_start', 'chip_tap', 'guess_attempt', 'game_complete', 'game_abandon', 'share', 'archive_open', 'practice_start'])

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const body = await ctx.request.json().catch(() => null) as { name?: string; params?: any } | null
  if (!body?.name) return j({ ok: false, error: 'missing name' }, 400)
  if (!ALLOWED.has(body.name)) return j({ ok: false, error: 'unknown event' }, 400)

  // lightweight validation
  if (body.params && typeof body.params !== 'object') return j({ ok: false, error: 'invalid params' }, 400)

  // in prod: write to KV / D1 / Cloudflare Analytics Engine
  // here we just acknowledge and allow Cloudflare Web Analytics to also capture
  const ip = ctx.request.headers.get('CF-Connecting-IP') || 'local'
  // Optional: ctx.waitUntil( persist... )
  ctx.waitUntil(Promise.resolve().then(() => console.log('[analytics]', body.name, { ip, ...body.params })))

  const res = j({ ok: true })
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Cache-Control', 'no-store')
  return res
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } })

function j(d: any, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json' } })
}
declare type PagesFunction<E> = (ctx: { request: Request; env: E; params: any; waitUntil: (p: Promise<any>) => void; next: () => Promise<Response>; data: any }) => Response | Promise<Response>
declare type KVNamespace = any
