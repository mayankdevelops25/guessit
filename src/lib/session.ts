// Anonymous session — Wordle-style device session without login
// Inspired by NYT Wordle's anonymous → account upgrade flow:
// - Before login, Wordle stores game state + stats in localStorage under
//   `nyt-wordle-statistics` and `games-state-wordleV2/*` — trivially editable.
// - After NYT Account linking, server becomes source of truth and syncs via timestamp.
// Our approach: from day one, server is source of truth via anonymous session token.
// Client keeps localStorage as offline cache, but streak is validated server-side.

const KEY = 'gotd-session-id'
const LEGACY_STREAK = 'gotd-streak'
const LEGACY_HISTORY = 'gotd-history'

export type SessionInfo = {
  id: string
  createdAt: number
  lastSeen: number
  streak: { count: number; lastDate: string | null; freezeAvailable: boolean }
  historyCount: number
}

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'ss-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getLocalSessionId(): string | null {
  try { return localStorage.getItem(KEY) } catch { return null }
}

export function setLocalSessionId(id: string) {
  try { localStorage.setItem(KEY, id) } catch {}
}

export function ensureLocalSessionId(): string {
  let id = getLocalSessionId()
  if (!id) {
    id = uuid()
    setLocalSessionId(id)
  }
  return id
}

// For requests — always attach
export function getSessionHeaders(): Record<string, string> {
  const id = ensureLocalSessionId()
  return { 'X-Session-Id': id, 'X-Client-Time': new Date().toISOString() }
}

// Migration helper: if user had legacy local streak, we will send it once on session create
// so server can seed initial streak (but server will validate dates)
export function getLegacySeed() {
  try {
    const s = localStorage.getItem(LEGACY_STREAK)
    const h = localStorage.getItem(LEGACY_HISTORY)
    return {
      streak: s ? JSON.parse(s) : null,
      history: h ? JSON.parse(h) : null,
    }
  } catch { return { streak: null, history: null } }
}

export function clearLegacy() {
  // keep for fallback offline; don't delete yet
}
