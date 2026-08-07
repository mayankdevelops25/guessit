// GET /api/health — for uptime + client backend detection

export const onRequestGet: PagesFunction<any> = async () => {
  const body = {
    ok: true,
    version: '1.0.0',
    mode: 'cloudflare-pages-functions',
    time: new Date().toISOString(),
    features: ['daily', 'chip', 'guess', 'analytics'],
  }
  const res = new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } })
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Cache-Control', 'no-store')
  return res
}
declare type PagesFunction<E> = (ctx: { request: Request; env: E; params: any; waitUntil: (p: Promise<any>) => void; next: () => Promise<Response>; data: any }) => Response | Promise<Response>
