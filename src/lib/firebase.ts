import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAnalytics, logEvent as firebaseLogEvent, isSupported, type Analytics } from 'firebase/analytics'
import { analyticsAllowed } from './consent'

// Firebase config — set via Vite env or .env.example
// Safe to commit placeholder; real values injected at build/deploy
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'guess-of-the-day-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'guess-of-the-day-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'guess-of-the-day-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:demo',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-DEMO0000',
}

let app: FirebaseApp | null = null
let analytics: Analytics | null = null
let analyticsReady = false

function getApp(): FirebaseApp {
  if (app) return app
  if (getApps().length) {
    app = getApps()[0]!
  } else {
    app = initializeApp(firebaseConfig)
  }
  return app
}

export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (analyticsReady) return analytics
  if (typeof window === 'undefined') return null
  // Respect the player's privacy preference (Manage Privacy Preferences)
  if (!analyticsAllowed()) {
    console.info('[firebase] Analytics skipped — player opted out')
    analyticsReady = true
    return null
  }
  // isSupported guards against SSR, ad-blockers, private browsing
  try {
    const supported = await isSupported().catch(() => false)
    if (!supported) {
      console.warn('[firebase] Analytics not supported in this environment')
      analyticsReady = true
      return null
    }
    const a = getApp()
    analytics = getAnalytics(a)
    analyticsReady = true
    // enable debug mode in dev
    if (import.meta.env.DEV) {
      console.info('[firebase] Analytics initialized', { projectId: firebaseConfig.projectId, measurementId: firebaseConfig.measurementId })
    }
    return analytics
  } catch (e) {
    console.warn('[firebase] Analytics init failed', e)
    analyticsReady = true
    return null
  }
}

export function logEvent(name: string, params?: Record<string, any>) {
  // Respect the player's privacy preference — no analytics when opted out
  if (!analyticsAllowed()) return
  // queue until ready, fallback to console + server beacon
  if (analytics) {
    try {
      firebaseLogEvent(analytics, name as any, params)
    } catch (e) {
      console.warn('[firebase] logEvent failed', e)
    }
  }
  // mirror to backend + console for observability (FR-9)
  if (typeof window !== 'undefined') {
    // fire-and-forget to backend analytics endpoint (Cloudflare Function or Vite dev middleware)
    try {
      const body = JSON.stringify({ name, params: { ...params, ts: Date.now(), path: window.location.pathname } })
      const url = '/api/analytics'
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' })
        navigator.sendBeacon(url, blob)
      } else {
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
      }
    } catch {}
    if (import.meta.env.DEV) console.log(`[analytics] ${name}`, params)
  }
}

export const AnalyticsEvents = {
  START: 'game_start',
  CHIP_TAP: 'chip_tap',
  GUESS_ATTEMPT: 'guess_attempt',
  COMPLETE: 'game_complete',
  ABANDON: 'game_abandon',
  SHARE: 'share',
  ARCHIVE_OPEN: 'archive_open',
  PRACTICE_START: 'practice_start',
} as const

export { firebaseConfig }
