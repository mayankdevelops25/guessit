// Analytics wrapper — ensures FR-9 events are logged to both Firebase + backend
// Usage: analytics.gameStart({ date, category }) etc.

import { logEvent, initFirebaseAnalytics, AnalyticsEvents } from './firebase'

export async function initAnalytics() {
  await initFirebaseAnalytics().catch(() => {})
  // also init Cloudflare Web Analytics if present (beacon.js auto)
}

export const analytics = {
  gameStart: (p: { date: string; category: string; puzzleNo: number; mode: 'daily' | 'practice' | 'archive' }) =>
    logEvent(AnalyticsEvents.START, p),
  chipTap: (p: { chipId: string; chipText: string; result: boolean; remaining: number; taps: number }) =>
    logEvent(AnalyticsEvents.CHIP_TAP, p),
  guess: (p: { guessId: string; correct: boolean; attempts: number; taps: number }) =>
    logEvent(AnalyticsEvents.GUESS_ATTEMPT, p),
  complete: (p: { won: boolean; taps: number; attempts: number; date: string; puzzleNo: number }) =>
    logEvent(AnalyticsEvents.COMPLETE, p),
  abandon: (p: { date: string; taps: number; remaining: number; at: 'giveup' | 'exit' }) =>
    logEvent(AnalyticsEvents.ABANDON, p),
  share: (p: { date: string; taps: number; streak: number }) =>
    logEvent(AnalyticsEvents.SHARE, p),
  archive: (p: { action: 'open' | 'play'; date?: string }) =>
    logEvent(AnalyticsEvents.ARCHIVE_OPEN, { ...p }),
  practice: (p: { randomId: string }) =>
    logEvent(AnalyticsEvents.PRACTICE_START, p),
}
