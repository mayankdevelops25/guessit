// Client API — Cloudflare Pages Functions in prod, Vite dev mock locally
// All daily-play requests are session-aware (anonymous, no login) — Wordle pattern
// Hidden answer never leaves server (FR-10)

import { getSessionHeaders, ensureLocalSessionId } from './session'

export type DailyResponse = {
  date: string
  puzzleNo: number
  category: string
  total: number
  candidates: { id: string; label: string; emoji: string; color: string; fact: string }[]
  chips: { id: string; text: string }[]
  cacheHit?: boolean
}

export type ChipResponse = {
  ok: true
  chipId: string
  result: boolean
  chipText: string
  remaining: number // server-computed
}

export type GuessResponse = {
  ok: true
  correct: boolean
  guessId: string
  answer?: { id: string; label: string; emoji: string; color: string; fact: string }
  attempts: number
  streak?: { count: number; lastDate: string | null }
}

export type SessionResponse = {
  ok: true
  session: { id: string; createdAt: number; lastSeen: number; streak: { count: number; lastDate: string | null; freezeAvailable: boolean }, historyCount: number }
  isNew: boolean
}

export type StateResponse = {
  ok: true
  date: string
  state: {
    asked: { id: string; text: string; result: boolean }[]
    taps: number
    guessAttempts: number
    completed: boolean
    won: boolean | null
    remaining?: number
  } | null
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || ''

function url(path: string) { return `${API_BASE}${path}` }

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as any).error || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

function sessHeaders(extra: Record<string,string> = {}) {
  return { ...getSessionHeaders(), ...extra }
}

// Session — idempotent create/refresh
export async function ensureSession(): Promise<SessionResponse> {
  const id = ensureLocalSessionId()
  const res = await fetch(url('/api/session'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...sessHeaders() },
    body: JSON.stringify({ clientTime: new Date().toISOString() }),
  })
  const data = await handle<SessionResponse>(res)
  // sync id if server rotated (shouldn't, but be safe)
  if (data.session?.id && data.session.id !== id) {
    try { localStorage.setItem('gotd-session-id', data.session.id) } catch {}
  }
  return data
}

export async function fetchSession(): Promise<SessionResponse | null> {
  try {
    const res = await fetch(url('/api/session'), { headers: { ...sessHeaders() } })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

export async function fetchDaily(date: string, signal?: AbortSignal): Promise<DailyResponse> {
  const res = await fetch(url(`/api/daily?date=${encodeURIComponent(date)}`), {
    headers: { 'Accept': 'application/json', ...sessHeaders() },
    signal,
  })
  return handle<DailyResponse>(res)
}

export async function postChip(date: string, chipId: string): Promise<ChipResponse> {
  const res = await fetch(url('/api/chip'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...sessHeaders() },
    body: JSON.stringify({ date, chipId }),
  })
  return handle<ChipResponse>(res)
}

export async function postGuess(date: string, guessId: string): Promise<GuessResponse> {
  const res = await fetch(url('/api/guess'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...sessHeaders() },
    body: JSON.stringify({ date, guessId }),
  })
  return handle<GuessResponse>(res)
}

export async function fetchState(date: string): Promise<StateResponse> {
  const res = await fetch(url(`/api/state?date=${encodeURIComponent(date)}`), { headers: { ...sessHeaders() } })
  return handle<StateResponse>(res)
}

export async function syncState(date: string, payload: { asked: {id:string;text:string;result:boolean}[], taps:number, guessAttempts:number, completed?:boolean, won?:boolean|null }): Promise<StateResponse> {
  const res = await fetch(url('/api/state'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...sessHeaders() },
    body: JSON.stringify({ date, ...payload }),
  })
  return handle<StateResponse>(res)
}

// Share verification token — server signs taps claim so shared cards can't be spoofed
export async function fetchShareToken(date: string): Promise<{ ok:true, token:string, shareText:string } | { ok:false, error:string }> {
  const res = await fetch(url(`/api/share?date=${encodeURIComponent(date)}`), { headers: { ...sessHeaders() } })
  return handle<any>(res)
}

export async function checkHealth(): Promise<{ ok: boolean; version: string; mode: string }> {
  const res = await fetch(url('/api/health'), { headers: { ...sessHeaders() } }).catch(() => null)
  if (!res) return { ok: false, version: 'offline', mode: 'offline' }
  try { return await res.json() } catch { return { ok: false, version: 'error', mode: 'error' } }
}
