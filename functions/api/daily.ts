// Cloudflare Pages Function — GET /api/daily?date=YYYY-MM-DD
// Serves daily category + chip list WITHOUT revealing hidden answer (FR-10)
// Edge-cached, deterministic, no AI — depends only on content.ts
// Now session-aware for analytics binding, but still cacheable per-date (Vary: X-Session-Id not needed)

import { getDailyAnswer, getDailyCategory, puzzleNumber, toPublicCandidate } from '../../src/lib/content'

export interface Env {}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ ok: false, error: 'invalid date' }, 400)
  }

  void getDailyAnswer(date)

  const cat = getDailyCategory(date)
  const puzzleNo = puzzleNumber(date)
  const candidates = cat.answers.map(toPublicCandidate)
  const chips = cat.chips.map(c => ({ id: c.id, text: c.text }))

  const res = json({
    date,
    puzzleNo,
    category: cat.id,
    categoryLabel: cat.label,
    total: cat.answers.length,
    candidates,
    chips,
    cacheHit: false,
  })

  // aggressively edge-cache: same for all players, immutable per day
  res.headers.set('Cache-Control', 'public, max-age=60, s-maxage=86400, stale-while-revalidate=3600')
  res.headers.set('CDN-Cache-Control', 'public, s-maxage=86400')
  res.headers.set('X-Puzzle-No', String(puzzleNo))
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Session-Id, X-Client-Time')
  res.headers.set('Vary', 'Accept-Encoding')
  return res
}

export const onRequestOptions: PagesFunction<Env> = async () => new Response(null,{status:204, headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Session-Id, X-Client-Time'}})

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

declare type PagesFunction<E> = (ctx: { request: Request; env: E; params: any; waitUntil: (p: Promise<any>) => void; next: () => Promise<Response>; data: any }) => Response | Promise<Response>
