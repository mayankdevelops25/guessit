// Lightweight audio via Web Audio API — zero files, zero network requests.
// Subtle oscillator bleeps for chip taps, guesses, and wins.
// Player can disable via localStorage.

const KEY = 'gotd-audio-enabled'
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx || ctx.state === 'closed') {
    try { ctx = new AudioContext() } catch { return null }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

export function audioEnabled(): boolean {
  try { return localStorage.getItem(KEY) !== 'false' } catch { return true }
}

export function setAudioEnabled(v: boolean) {
  try { localStorage.setItem(KEY, String(v)) } catch {}
  if (!v && ctx) { ctx.close().catch(() => {}); ctx = null }
}

function tone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.08) {
  const c = getCtx()
  if (!c || !audioEnabled()) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + duration)
}

export function playTap() {
  tone(660, 0.08, 'sine', 0.05)
}

export function playYes() {
  tone(880, 0.12, 'sine', 0.06)
  setTimeout(() => tone(1100, 0.1, 'sine', 0.04), 60)
}

export function playNo() {
  tone(300, 0.14, 'triangle', 0.06)
}

export function playWin() {
  tone(523, 0.1, 'sine', 0.07)
  setTimeout(() => tone(659, 0.1, 'sine', 0.07), 100)
  setTimeout(() => tone(784, 0.1, 'sine', 0.07), 200)
  setTimeout(() => tone(1047, 0.18, 'sine', 0.07), 300)
}

export function playWrongGuess() {
  tone(200, 0.2, 'square', 0.06)
  setTimeout(() => tone(150, 0.25, 'square', 0.06), 150)
}

export function playGiveUp() {
  tone(400, 0.12, 'sawtooth', 0.05)
  setTimeout(() => tone(300, 0.12, 'sawtooth', 0.05), 120)
  setTimeout(() => tone(200, 0.16, 'sawtooth', 0.05), 240)
}
