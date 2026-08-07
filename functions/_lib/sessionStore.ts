// Shared session store — used by all Functions
// Prod: Cloudflare KV (SESSION_KV). Dev: in-memory Map (vite mock duplicates this logic)

export type SessionStreak = { count: number; lastDate: string | null; freezeAvailable: boolean }
export type SessionState = {
  asked: { id: string; text: string; result: boolean }[]
  taps: number
  guessAttempts: number
  completed: boolean
  won: boolean | null
  updatedAt: number
}

export type Session = {
  id: string
  createdAt: number
  lastSeen: number
  ip: string
  ua: string
  streak: SessionStreak
  history: Record<string, { taps: number; won: boolean; label: string; ts: number }>
  states: Record<string, SessionState>
}

const mem = new Map<string, Session>()

export function getStore(env: any): {
  get: (id: string) => Promise<Session | null>
  put: (s: Session) => Promise<void>
} {
  const kv = env?.SESSION_KV as any
  if (kv && kv.get && kv.put) {
    return {
      get: async (id: string) => {
        const v = await kv.get(`sess:${id}`, { type: 'json' }).catch(() => null)
        return v as Session | null
      },
      put: async (s: Session) => {
        await kv.put(`sess:${s.id}`, JSON.stringify(s), { expirationTtl: 60 * 60 * 24 * 90 })
      },
    }
  }
  return {
    get: async (id: string) => mem.get(id) || null,
    put: async (s: Session) => { mem.set(s.id, s) },
  }
}

export function newSession(id: string, ip: string, ua: string): Session {
  return {
    id,
    createdAt: Date.now(),
    lastSeen: Date.now(),
    ip,
    ua,
    streak: { count: 0, lastDate: null, freezeAvailable: true },
    history: {},
    states: {},
  }
}

export function isValidSessionId(id: string) {
  return typeof id === 'string' && id.length >= 8 && id.length <= 128
}

export function yesterdayStr(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export function isConsecutive(lastDate: string | null, currentDate: string) {
  if (!lastDate) return false
  return yesterdayStr(currentDate) === lastDate
}

export function isSameDay(a: string | null, b: string) {
  return a === b
}
