// Consent & privacy preferences — lightweight, localStorage-based.
// Pattern mirrors NYT/OneTrust: Essential is always on; Analytics can be toggled.
// The game keeps working fully without analytics consent.

export type ConsentPrefs = {
  essential: boolean // always true — session, streak, progress
  analytics: boolean // Firebase + Cloudflare Web Analytics
  marketing: boolean // not used at v1 (no marketing trackers ship) — reserved
  savedAt?: number
}

const KEY = 'gotd-consent'

export function getConsent(): ConsentPrefs | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    return {
      essential: p.essential !== false,
      analytics: p.analytics !== false,
      marketing: p.marketing === true,
      savedAt: p.savedAt || Date.now(),
    }
  } catch { return null }
}

export function setConsent(p: ConsentPrefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...p, savedAt: Date.now() }))
  } catch {}
}

export function hasConsent() {
  return getConsent() !== null
}

/** Analytics events may fire only when the player hasn't opted out. */
export function analyticsAllowed(): boolean {
  const c = getConsent()
  if (!c) return true // anonymous events start until the player chooses (banner informs them)
  return c.analytics
}

/** Full opt-out — used by "Reset" in preferences. */
export function revokeConsent() {
  try { localStorage.removeItem(KEY) } catch {}
}
