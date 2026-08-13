import { useEffect, useMemo, useState } from 'react'
import { getDailyAnswer, getDailyCategory, CATEGORIES, flagUrl, logoUrl, logoFallback, figureInitials, puzzleNumber, formatDay, getLocalDay, type Answer, type ChipDef } from '@/lib/content'
import { fetchDaily, postChip, postGuess, checkHealth, ensureSession, fetchState, syncState, fetchShareToken } from '@/lib/api'
import { initAnalytics, analytics } from '@/lib/analytics'
import { initFirebaseAnalytics } from '@/lib/firebase'
import { ensureLocalSessionId } from '@/lib/session'
import DocsPage, { type DocId } from '@/pages/Docs'
import { getConsent, setConsent, hasConsent, revokeConsent } from '@/lib/consent'
import { playTap, playYes, playNo, playWin, playWrongGuess, playGiveUp, audioEnabled, setAudioEnabled } from '@/lib/audio'

type AskedChip = { id: string; text: string; result: boolean }

function WikiGlyph({ a, size, rounded }: { a: Answer; size: number; rounded: string }) {
  const [src, setSrc] = useState<string | null>(() => {
    try { return sessionStorage.getItem('wiki_img_' + a.wiki) } catch { return null }
  })

  useEffect(() => {
    if (src || !a.wiki) return
    let active = true
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${a.wiki}`)
      .then(r => r.json())
      .then(d => {
        if (active && d?.thumbnail?.source) {
          setSrc(d.thumbnail.source)
          try { sessionStorage.setItem('wiki_img_' + a.wiki, d.thumbnail.source) } catch {}
        }
      }).catch(() => {})
    return () => { active = false }
  }, [a.wiki, src])

  if (!src) {
    // loading fallback -> monogram
    const fs = Math.max(10, Math.round(size * 0.46))
    return (
      <span
        className={`grid place-items-center font-black text-black/80 leading-none ${rounded}`}
        style={{ width: size, height: size, fontSize: fs, letterSpacing: '-0.02em', background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.12)' }}
      >
        {figureInitials(a)}
      </span>
    )
  }

  return (
    <img
      src={src} alt={`Portrait of ${a.label}`} loading="lazy" decoding="async"
      width={size} height={size}
      className={`${rounded} object-cover`}
      style={{ width: size, height: size, backgroundColor: '#FFFBF0' }}
      onError={e => {
        const t = e.currentTarget as HTMLImageElement
        t.onerror = null; t.style.display = 'none'
        const p = t.parentElement; if (p) p.innerHTML = `<span style="font-size:${Math.round(size * 0.85)}px">${a.emoji}</span>`
      }}
    />
  )
}

/**
 * Visual for an answer tile — four modes, all safe:
 *  - country (iso)   → real flag image (flagcdn)
 *  - company (domain)→ real brand logo (DuckDuckGo → Google favicon fallback → emoji)
 *  - figure (wiki)   → real portrait photo (Wikipedia REST API → monogram fallback)
 *  - animal          → emoji
 * External images degrade gracefully via onError so nothing ever breaks offline.
 */
function Glyph({ a, size = 26, rounded = 'rounded-[4px]' }: { a: Answer; size?: number; rounded?: string }) {
  // 1) country flag
  const flag = flagUrl(a, size <= 28 ? 'sm' : 'md')
  if (flag) {
    return (
      <img
        src={flag} alt={`Flag of ${a.label}`} loading="lazy" decoding="async"
        width={Math.round(size * 1.5)} height={size}
        className={`${rounded} object-cover`}
        style={{ width: Math.round(size * 1.5), height: size }}
        onError={e => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.style.display = 'none'; const p = t.parentElement; if (p) p.innerHTML = `<span style="font-size:${size}px">${a.emoji}</span>` }}
      />
    )
  }
  // 2) company logo
  const logo = logoUrl(a)
  if (logo) {
    return (
      <img
        src={logo} alt={`Logo of ${a.label}`} loading="lazy" decoding="async"
        width={size} height={size}
        className={`${rounded} object-contain`}
        style={{ width: size, height: size }}
        onError={e => {
          const t = e.currentTarget as HTMLImageElement
          const fb = logoFallback(a)
          if (fb && t.src !== fb) { t.src = fb; return }
          t.onerror = null; t.style.display = 'none'
          const p = t.parentElement; if (p) p.innerHTML = `<span style="font-size:${Math.round(size * 0.85)}px">${a.emoji}</span>`
        }}
      />
    )
  }
  // 3) historical figure portrait
  if (a.wiki) {
    return <WikiGlyph a={a} size={size} rounded={rounded} />
  }
  // 4) animal emoji
  return <span style={{ fontSize: size, lineHeight: 1 }} className="drop-shadow-sm">{a.emoji}</span>
}

export default function App() {
  const today = getLocalDay()
  const [selectedDate, setSelectedDate] = useState(today)
  // One category per day, system-chosen (PRD §11). Rotates deterministically.
  const [category, setCategory] = useState(() => getDailyCategory(today))
  const pool = category.answers
  const chipDefs = category.chips
  const [hidden, setHidden] = useState<Answer>(() => getDailyAnswer(today))
  const [candidates, setCandidates] = useState<Answer[]>(() => [...getDailyCategory(today).answers])
  const [asked, setAsked] = useState<AskedChip[]>([])
  const [taps, setTaps] = useState(0)
  const [guessAttempts, setGuessAttempts] = useState(0)
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'won' | 'lost'>('start')
  const [showArchive, setShowArchive] = useState(false)
  const [practiceMode, setPracticeMode] = useState(false)
  const [shake, setShake] = useState(false)
  const [particles, setParticles] = useState<{ x: number, y: number, id: number }[]>([])
  const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(new Set())
  const [vanishedIds, setVanishedIds] = useState<Set<string>>(new Set())
  const [lastResult, setLastResult] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)
  const [wrongGuessId, setWrongGuessId] = useState<string | null>(null)
  const [backendLive, setBackendLive] = useState<boolean | null>(null)
  const [chipPending, setChipPending] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>(() => ensureLocalSessionId())
  const [shareToken, setShareToken] = useState<string | null>(null)
  // near-miss reveal + guess-limit system
  const [revealPending, setRevealPending] = useState(false)
  const [maxWrongGuesses, setMaxWrongGuesses] = useState<number | null>(null)
  const [wrongGuessesUsed, setWrongGuessesUsed] = useState(0)

  // docs & privacy preferences
  const [docView, setDocView] = useState<DocId | null>(() => {
    const m = window.location.hash.match(/^#\/docs\/(\w+)/)
    if (m && ['sitemap', 'privacy', 'terms', 'cookies', 'sale'].includes(m[1])) return m[1] as DocId
    return null
  })
  const [showPrefs, setShowPrefs] = useState(false)
  const [showBanner, setShowBanner] = useState(() => !hasConsent())
  const [prefs, setPrefs] = useState(() => getConsent() || { essential: true, analytics: true, marketing: false })
  const [showHowTo, setShowHowTo] = useState(() => {
    try { return !localStorage.getItem('gotd-seen-howto') } catch { return false }
  })
  const closeHowTo = () => {
    setShowHowTo(false)
    try { localStorage.setItem('gotd-seen-howto', '1') } catch {}
  }
  const [showTimeLeft, setShowTimeLeft] = useState(false)

  // audio toggle
  const [audioOn, setAudioOn] = useState(() => audioEnabled())

  // countdown until next puzzle (Wordle habit hook)
  const [countdown, setCountdown] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const next = new Date(now)
      next.setDate(next.getDate() + 1)
      next.setHours(0, 0, 0, 0)
      const diff = next.getTime() - now.getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  // streak + stats from localStorage (offline cache, server is truth when online)
  const [streak, setStreak] = useState(() => {
    try { const s = localStorage.getItem('gotd-streak'); return s ? JSON.parse(s) : { count: 0, last: null } } catch { return { count: 0, last: null } }
  })
  const [history, setHistory] = useState<Record<string, { taps: number, won: boolean, label: string }>>(() => {
    try { const h = localStorage.getItem('gotd-history'); return h ? JSON.parse(h) : {} } catch { return {} }
  })
  const [best, setBest] = useState<number | null>(() => {
    try { const b = localStorage.getItem('gotd-best'); return b ? Number(b) : null } catch { return null }
  })
  const [freezeAvailable, setFreezeAvailable] = useState(false)

  const totalPool = pool.length
  const remaining = candidates.length
  const progress = ((totalPool - remaining) / totalPool) * 100

  // Single init effect — one session call, one health check (prevents waterfall)
  useEffect(() => {
    initAnalytics()
    initFirebaseAnalytics()
    // mint anonymous session — also returns streak + freeze (single network call)
    ensureSession().then(r => {
      setSessionId(r.session.id)
      if (r.session.streak) {
        if (r.session.streak.freezeAvailable) setFreezeAvailable(true)
        const srv = r.session.streak
        setStreak((prev: any) => {
          if (srv.lastDate && srv.count > prev.count) return { count: srv.count, last: srv.lastDate }
          if (srv.lastDate && !prev.last) return { count: srv.count, last: srv.lastDate }
          return prev
        })
      }
      setBackendLive(true)
    }).catch(() => {
      checkHealth().then(h => setBackendLive(h.ok)).catch(() => setBackendLive(false))
    })
    fetchDaily(today).catch(() => {})
  }, [today])

  // docs router — hash-based so links are shareable/crawlable (e.g. #/docs/privacy)
  useEffect(() => {
    const onHash = () => {
      const m = window.location.hash.match(/^#\/docs\/(\w+)/)
      if (m && ['sitemap', 'privacy', 'terms', 'cookies', 'sale'].includes(m[1])) {
        setDocView(m[1] as DocId)
      } else {
        setDocView(null)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const [docHistory, setDocHistory] = useState<DocId[]>([])

  const goHome = () => {
    setDocHistory([])
    if (window.location.hash.startsWith('#/docs')) {
      try {
        history.pushState("", document.title, window.location.pathname + window.location.search)
      } catch {
        window.location.hash = ""
      }
    }
    setDocView(null)
    setShowArchive(false)
    setShowHowTo(false)
    setShowShare(false)
    setShowPrefs(false)
    if (gameState === 'playing') {
      analytics.abandon({ date: selectedDate, taps, remaining, at: 'exit' })
    }
    setGameState('start')
  }

  const openDoc = (id: DocId) => {
    setDocHistory(prev => (docView ? [...prev, docView] : prev))
    window.location.hash = `/docs/${id}`
    setDocView(id)
  }
  const closeDoc = () => {
    if (docHistory.length > 0) {
      const prev = docHistory[docHistory.length - 1]
      setDocHistory(h => h.slice(0, -1))
      window.location.hash = `/docs/${prev}`
      setDocView(prev)
    } else {
      if (window.location.hash.startsWith('#/docs')) {
        try {
          history.pushState("", document.title, window.location.pathname + window.location.search)
        } catch {
          window.location.hash = ""
        }
      }
      setDocView(null)
    }
  }
  const acceptAllCookies = () => {
    const p = { essential: true, analytics: true, marketing: false }
    setPrefs(p)
    setConsent(p)
    setShowBanner(false)
    setShowPrefs(false)
  }
  const savePrefs = () => {
    setConsent(prefs)
    setShowBanner(false)
    setShowPrefs(false)
    // re-init analytics if the player just enabled them
    if (prefs.analytics) initFirebaseAnalytics().catch(() => {})
  }
  const resetPrefs = () => {
    revokeConsent()
    setPrefs({ essential: true, analytics: true, marketing: false })
    setShowPrefs(false)
    setShowBanner(true)
  }

  // ranking — deterministic info-gain
  const rankedChips = useMemo(() => {
    const askedIds = new Set(asked.map(a => a.id))
    const remainingChips = chipDefs.filter(c => !askedIds.has(c.id))
    const scored = remainingChips.map(chip => {
      const yes = candidates.filter(a => chip.check(a)).length
      const no = candidates.length - yes
      const total = candidates.length
      const score = total === 0 ? 0 : 1 - Math.abs(yes - no) / total
      return { chip, score }
    })
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, 6)
  }, [candidates, asked])



  // keyboard — 1-6 chips, Esc pause, G to guess
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return
      if (e.key >= '1' && e.key <= '6') {
        const idx = Number(e.key) - 1
        const entry = rankedChips[idx]
        if (entry && !chipPending) handleChipTap(entry.chip)
      }
      if (e.key === 'Escape') setGameState(s => s === 'paused' ? 'playing' : 'paused')
      if (e.key.toLowerCase() === 'g' && remaining <= 5) {
        document.getElementById('guess-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [rankedChips, gameState, remaining, chipPending])

  // persist local cache
  useEffect(() => { localStorage.setItem('gotd-streak', JSON.stringify(streak)) }, [streak])
  useEffect(() => { localStorage.setItem('gotd-history', JSON.stringify(history)) }, [history])
  useEffect(() => { if (best !== null) localStorage.setItem('gotd-best', String(best)) }, [best])

  // sync state to server debounced (for resume + anti-cheat audit)
  useEffect(() => {
    if (gameState !== 'playing' || practiceMode) return
    if (!sessionId || !backendLive) return
    const t = setTimeout(() => {
      syncState(selectedDate, { asked, taps, guessAttempts, completed: false, won: null }).catch(()=>{})
    }, 600)
    return () => clearTimeout(t)
  }, [asked, taps, guessAttempts, gameState, practiceMode, selectedDate, sessionId, backendLive])

  const restoreFromServer = async (dateStr: string) => {
    try {
      const cat = getDailyCategory(dateStr)
      const r = await fetchState(dateStr)
      if (r.state) {
        // rebuild candidates from asked results using that day's category chips
        let cands: Answer[] = [...cat.answers]
        for (const a of r.state.asked) {
          const chip = cat.chips.find(ch => ch.id === a.id)
          if (chip) cands = cands.filter(x => chip.check(x) === a.result)
        }
        setAsked(r.state.asked)
        setTaps(r.state.taps)
        setGuessAttempts(r.state.guessAttempts)
        setCandidates(cands)
        const elims = cat.answers.filter(x => !cands.some(c => c.id === x.id)).map(x => x.id)
        setEliminatedIds(new Set(elims))
        setVanishedIds(new Set(elims))
        if (r.state.completed) {
          setGameState(r.state.won ? 'won' : 'lost')
        }
        return r.state.completed
      }
    } catch {}
    return false
  }

  const startDaily = async () => {
    setShowHowTo(false)
    const cat = getDailyCategory(today)
    const h = getDailyAnswer(today)
    setCategory(cat)
    setHidden(h)
    setSelectedDate(today)
    setPracticeMode(false)
    setLastResult(null)
    setWrongGuessId(null)
    setCandidates([...cat.answers])
    setAsked([])
    setTaps(0)
    setGuessAttempts(0)
    setMaxWrongGuesses(null)
    setWrongGuessesUsed(0)
    setEliminatedIds(new Set())
    setVanishedIds(new Set())
    setShareToken(null)
    setGameState('playing')
    window.scrollTo(0, 0)

    // Restore active in-progress state if reloaded mid-game
    if (backendLive !== false) {
      try {
        const r = await fetchState(today)
        if (r?.state && !r.state.completed && r.state.asked?.length > 0) {
          let cands: Answer[] = [...cat.answers]
          for (const a of r.state.asked) {
            const chip = cat.chips.find(ch => ch.id === a.id)
            if (chip) cands = cands.filter(x => chip.check(x) === a.result)
          }
          setAsked(r.state.asked)
          setTaps(r.state.taps)
          setGuessAttempts(r.state.guessAttempts)
          setCandidates(cands)
          const elims = cat.answers.filter(x => !cands.some(c => c.id === x.id)).map(x => x.id)
          setEliminatedIds(new Set(elims))
          setVanishedIds(new Set(elims))
        }
      } catch {}
    }

    try { await fetchDaily(today) } catch {}
    analytics.gameStart({ date: today, category: cat.id, puzzleNo: puzzleNumber(today), mode: 'daily' })
  }

  const startPractice = () => {
    setShowHowTo(false)
    // practice picks a random category too — keeps both pools warm
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    let h: Answer
    do { h = cat.answers[Math.floor(Math.random() * cat.answers.length)] } while (h.id === hidden.id)
    setCategory(cat)
    setHidden(h)
    setSelectedDate('practice-' + Date.now())
    setCandidates([...cat.answers])
    setAsked([])
    setTaps(0)
    setGuessAttempts(0)
    setMaxWrongGuesses(null)
    setWrongGuessesUsed(0)
    setPracticeMode(true)
    setEliminatedIds(new Set())
    setVanishedIds(new Set())
    setLastResult(null)
    setWrongGuessId(null)
    setShareToken(null)
    setGameState('playing')
    window.scrollTo(0, 0)
    analytics.practice({ randomId: h.id })
    analytics.gameStart({ date: 'practice', category: cat.id, puzzleNo: 0, mode: 'practice' })
  }

  const startArchiveDate = async (dateStr: string) => {
    const cat = getDailyCategory(dateStr)
    const h = getDailyAnswer(dateStr)
    setCategory(cat)
    setHidden(h)
    setSelectedDate(dateStr)
    setShowArchive(false)
    // try restore
    let restored = false
    if (backendLive !== false) {
      try { restored = await restoreFromServer(dateStr); } catch {}
      if (restored) {
        setPracticeMode(false)
        setLastResult(null)
        setWrongGuessId(null)
        fetchShareToken(dateStr).then(r=>{ if((r as any).ok) setShareToken((r as any).token)}).catch(()=>{})
        const s = await fetchState(dateStr).catch(()=>null)
        if (s?.state && !s.state.completed) setGameState('playing')
        // completed already handled
        try { await fetchDaily(dateStr) } catch {}
        analytics.archive({ action: 'play', date: dateStr })
        return
      }
    }
    setCandidates([...cat.answers])
    setAsked([])
    setTaps(0)
    setGuessAttempts(0)
    setMaxWrongGuesses(null)
    setWrongGuessesUsed(0)
    setPracticeMode(false)
    setEliminatedIds(new Set())
    setVanishedIds(new Set())
    setLastResult(null)
    setWrongGuessId(null)
    setShareToken(null)
    setGameState('playing')
    try { await fetchDaily(dateStr) } catch {}
    analytics.archive({ action: 'play', date: dateStr })
  }

  const handleChipTap = async (chip: ChipDef) => {
    if (gameState !== 'playing' || chipPending) return
    // Prime audio immediately inside the tap gesture. The yes/no sound follows
    // after the server result returns, but this keeps mobile browsers happy.
    playTap()
    setChipPending(chip.id)

    let result: boolean
    let serverOk = false
    if (!practiceMode && backendLive !== false) {
      try {
        const r = await postChip(selectedDate, chip.id)
        result = r.result
        serverOk = true
      } catch (e: any) {
        // if server says duplicate or completed, fallback gracefully
        if (String(e.message).includes('already')) {
          restoreFromServer(selectedDate).catch(() => {})
          setChipPending(null)
          return
        }
        result = chip.check(hidden)
      }
    } else {
      result = chip.check(hidden)
    }

    const newCandidates = candidates.filter(a => chip.check(a) === result)
    const eliminated = candidates.filter(a => chip.check(a) !== result).map(a => a.id)

    setChipPending(null)


    // audio + haptic
    if (result) {
      playYes()
      try { navigator.vibrate?.(10) } catch {}
    } else {
      playNo()
      try { navigator.vibrate?.(25) } catch {}
    }

    setShake(true)
    setTimeout(() => setShake(false), 420)
    setLastResult(result)
    setTimeout(() => setLastResult(null), 900)

    const id = Date.now()
    setParticles(p => [...p, { x: Math.random() * 100, y: Math.random() * 60, id }])
    setTimeout(() => setParticles(p => p.filter(pt => pt.id !== id)), 800)

    setTimeout(() => {
      setEliminatedIds(prev => {
        const s = new Set(prev)
        eliminated.forEach(id => s.add(id))
        return s
      })
    }, 150)

    setTimeout(() => {
      setVanishedIds(prev => {
        const s = new Set(prev)
        eliminated.forEach(id => s.add(id))
        return s
      })
    }, 650)

    const nextAsked = [...asked, { id: chip.id, text: chip.text, result }]
    setAsked(nextAsked)
    setCandidates(newCandidates)
    setTaps(t => t + 1)

    analytics.chipTap({ chipId: chip.id, chipText: chip.text, result, remaining: newCandidates.length, taps: taps + 1 })
    if (serverOk && backendLive === null) setBackendLive(true)
    // sync state (chip endpoint already did, but ensure)
    if (!practiceMode) syncState(selectedDate, { asked: nextAsked, taps: taps + 1, guessAttempts }).catch(()=>{})
  }

  const handleGuess = async (answer: Answer) => {
    if (gameState !== 'playing') return

    let isCorrect: boolean
    let serverStreak: { count:number; lastDate:string|null } | undefined
    if (!practiceMode && backendLive !== false) {
      try {
        const r = await postGuess(selectedDate, answer.id)
        isCorrect = r.correct
        serverStreak = r.streak as any
      } catch {
        isCorrect = answer.id === hidden.id
      }
    } else {
      isCorrect = answer.id === hidden.id
    }

    if (isCorrect) {
      const tapsUsed = taps
      const isDaily = !practiceMode && !selectedDate.startsWith('practice')
      setGameState('won')
      setGuessAttempts(a => a + 1)

      // fetch verified share token
      if (isDaily) fetchShareToken(selectedDate).then(r=>{ if((r as any).ok) setShareToken((r as any).token)}).catch(()=>{})

      if (isDaily) {
        const newHistory = { ...history, [selectedDate]: { taps: tapsUsed, won: true, label: hidden.label } }
        setHistory(newHistory)
        const newBest = best === null ? tapsUsed : Math.min(best, tapsUsed)
        setBest(newBest)
        if (serverStreak) {
          setStreak({ count: serverStreak.count, last: serverStreak.lastDate })
        } else {
          // offline fallback — clean streak logic
          const yesterday = new Date(today + 'T12:00:00')
          yesterday.setDate(yesterday.getDate() - 1)
          const yStr = yesterday.toISOString().split('T')[0]
          if (streak.last === today) {
            // already counted today — idempotent
          } else if (streak.last === yStr) {
            setStreak({ count: streak.count + 1, last: today })
          } else {
            setStreak({ count: 1, last: today })
          }
        }
        // also sync completed state
        syncState(selectedDate, { asked, taps: tapsUsed, guessAttempts: guessAttempts + 1, completed: true, won: true }).catch(()=>{})
      } else {
        const newBest = best === null ? tapsUsed : Math.min(best, tapsUsed)
        setBest(newBest)
      }
      const burst = Array.from({ length: 18 }, (_, i) => ({ x: Math.random() * 100, y: -10, id: Date.now() + i }))
      setParticles(burst)
      setTimeout(() => setParticles([]), 1200)
      playWin()
      try { navigator.vibrate?.([15, 30, 15, 30, 60]) } catch {}
      analytics.guess({ guessId: answer.id, correct: true, attempts: guessAttempts + 1, taps: tapsUsed })
      analytics.complete({ won: true, taps: tapsUsed, attempts: guessAttempts + 1, date: selectedDate, puzzleNo: puzzleNumber(selectedDate.startsWith('practice') ? today : selectedDate) })
    } else {
      // Determine max wrong guesses on first wrong guess based on pool size at that moment
      let currentMax = maxWrongGuesses
      if (currentMax === null) {
        currentMax = candidates.length >= 4 ? 2 : 1
        setMaxWrongGuesses(currentMax)
      }
      const newWrongCount = wrongGuessesUsed + 1
      setWrongGuessesUsed(newWrongCount)

      const newCandidates = candidates.filter(c => c.id !== answer.id)
      setWrongGuessId(answer.id)
      setGuessAttempts(a => a + 1)
      setShake(true)
      setTimeout(() => setShake(false), 400)
      playWrongGuess()
      try { navigator.vibrate?.(30) } catch {}

      if (newWrongCount >= currentMax) {
        // ❌ Lives exhausted — near-miss reveal then game over
        setRevealPending(true)
        setTimeout(() => {
          setWrongGuessId(null)
          setRevealPending(false)
          setGameState('lost')
          const isDaily = !practiceMode && !selectedDate.startsWith('practice')
          if (isDaily) setHistory(h => ({ ...h, [selectedDate]: { taps, won: false, label: hidden.label } }))
          if (!practiceMode) syncState(selectedDate, { asked, taps, guessAttempts: guessAttempts + 1, completed: true, won: false }).catch(()=>{})
          analytics.complete({ won: false, taps, attempts: guessAttempts + 1, date: selectedDate, puzzleNo: puzzleNumber(selectedDate.startsWith('practice') ? today : selectedDate) })
        }, 900)
      } else {
        // Still has guesses left — eliminate wrong answer and continue
        setTimeout(() => setWrongGuessId(null), 800)
        setCandidates(newCandidates)
        setEliminatedIds(prev => new Set([...prev, answer.id]))
        if (!practiceMode) syncState(selectedDate, { asked, taps, guessAttempts: guessAttempts + 1, completed: false, won: null }).catch(()=>{})
      }
      analytics.guess({ guessId: answer.id, correct: false, attempts: guessAttempts + 1, taps })
    }
  }

  const giveUp = () => {
    setGameState('lost')
    playGiveUp()
    setHistory(h => ({ ...h, [selectedDate]: { taps, won: false, label: hidden.label } }))
    if (!practiceMode) syncState(selectedDate, { asked, taps, guessAttempts, completed: true, won: false }).catch(()=>{})
    analytics.abandon({ date: selectedDate, taps, remaining, at: 'giveup' })
    analytics.complete({ won: false, taps, attempts: guessAttempts, date: selectedDate, puzzleNo: puzzleNumber(selectedDate.startsWith('practice') ? today : selectedDate) })
  }

  const shareText = useMemo(() => {
    const n = puzzleNumber(selectedDate.startsWith('practice') ? today : selectedDate)
    const grid = asked.map(a => a.result ? '🟩' : '🟥').join('') || '-'
    const modeTag = practiceMode ? 'Practice' : `Daily #${n}`
    const tokenHint = shareToken ? ` · ✓` : ''
    return `Guess of the Day | ${modeTag} · ${category.label}\nSolved in ${taps} taps ${taps <= 3 ? '⚡️' : taps <= 5 ? '✨' : ''}\n${grid}\nStreak: ${streak.count} 🔥${tokenHint}\nguessit-dub.pages.dev`
  }, [asked, taps, selectedDate, today, practiceMode, streak.count, shareToken])

  const copyShare = async () => {
    try { 
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText) 
      } else {
        const el = document.createElement('textarea')
        el.value = shareText
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1800) 
    } catch { 
      setCopied(true)
      setTimeout(() => setCopied(false), 1800) 
    }
    analytics.share({ date: selectedDate, taps, streak: streak.count })
  }

  const archiveDates = useMemo(() => {
    const out: string[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(today + 'T12:00:00')
      d.setDate(d.getDate() - i)
      out.push(d.toISOString().split('T')[0])
    }
    return out
  }, [today])

  // Archive dates older than 7 days — locked (premium placeholder)
  const olderArchiveDates = useMemo(() => {
    const out: string[] = []
    for (let i = 7; i < 30; i++) {
      const d = new Date(today + 'T12:00:00')
      d.setDate(d.getDate() - i)
      out.push(d.toISOString().split('T')[0])
    }
    return out
  }, [today])

  const score = Math.max(200, 1000 - (taps * 95) - (guessAttempts * 70) + (remaining <= 5 ? 50 : 0))

  return (
    <div className="min-h-[100dvh] bg-[#FFFBF0] text-[#0F0F0F] selection:bg-[#FFE03C] selection:text-black" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,800&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-mono2 { font-family: 'JetBrains Mono', monospace; }
        .shake { animation: shake 0.42s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px,0,0) rotate(-0.2deg); }
          20%, 80% { transform: translate3d(2px,0,0) rotate(0.3deg); }
          30%, 50%, 70% { transform: translate3d(-3px,0,0) rotate(-0.4deg); }
          40%, 60% { transform: translate3d(3px,0,0) rotate(0.4deg); }
        }
        .pop { animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes pop { 0% { transform: scale(0.92) } 100% { transform: scale(1) } }
        .float { animation: floatUp 0.8s ease-out forwards; }
        @keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 1 } 100% { transform: translateY(-60px) scale(1.2); opacity: 0 } }
        .confetti { animation: confettiFall 0.9s ease-out forwards; }
        @keyframes confettiFall { 0% { transform: translateY(-10px) rotate(0deg); opacity:1 } 100% { transform: translateY(220px) rotate(540deg); opacity:0 } }
        .grid-fade { transition: all 0.45s cubic-bezier(0.4,0,0.2,1); }
        @media (min-width: 1024px) { .lg\\:grid-cols-13 { grid-template-columns: repeat(13, minmax(0, 1fr)); } }
        :focus-visible { outline: 2px solid #0F0F0F; outline-offset: 2px; border-radius: 4px; }
        .scrollbar-none { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { 0% { opacity: 0 } 100% { opacity: 1 } }
      `}</style>

      <header className="sticky top-0 z-40 bg-[#FFFBF0]/80 backdrop-blur-xl border-b border-black/10">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 h-[56px] sm:h-[64px] flex items-center justify-between gap-2 sm:gap-4">
          <button 
            onClick={goHome} 
            aria-label="Guess of the Day Home" 
            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-xl p-1 -ml-1 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-black text-white grid place-items-center font-display text-[18px] leading-none tracking-tight shrink-0">G<span className="text-[#FFE03C]">.</span></div>
            <div className="hidden sm:block">
              <div className="font-display text-[18px] leading-none tracking-tight">GUESS OF THE DAY</div>
              <div className="text-[11px] font-bold tracking-[0.14em] text-black/50 -mt-0.5">DAILY DEDUCTION • {getDailyCategory(today).label}</div>
            </div>
            <div className="sm:hidden font-display text-[15px] tracking-tight">GUESS OF THE DAY</div>
          </button>

            <div className="flex items-center gap-1 sm:gap-2">
              {backendLive === false && (
                <span className="hidden sm:inline-flex items-center gap-1.5 bg-amber-100 border border-amber-400 rounded-full px-2.5 py-1 text-[11px] font-bold text-amber-800">⚡ OFFLINE</span>
              )}
              <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold bg-white border border-black/10 rounded-full px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {today} • #{puzzleNumber(today)}
              </div>
              <div className="relative group">
                <button onClick={() => { /* streak info */ setShowArchive(true) }} aria-label={`Streak: ${streak.count}`} className="flex items-center gap-1.5 bg-black text-white rounded-full px-3 py-1.5 h-9 min-h-[36px] text-[13px] font-extrabold">
                  <span className="text-[#FFE03C]">🔥</span> {streak.count}
                  <span className="hidden xs:inline sm:hidden lg:inline text-[11px] font-semibold opacity-70 ml-0.5">STREAK</span>
                </button>
                {freezeAvailable && streak.count > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#0EA5A4] border border-white rounded-full" title="Freeze available: one missed day forgiven" />
                )}
              </div>
            <button onClick={() => { const v = !audioOn; setAudioOn(v); setAudioEnabled(v) }} aria-label={audioOn ? 'Mute sounds' : 'Unmute sounds'} className="w-11 h-11 min-w-[44px] min-h-[44px] grid place-items-center rounded-full bg-white border border-black/10 hover:bg-black hover:text-white transition-colors" title={audioOn ? 'Sound on' : 'Sound off'}>
              {audioOn ? '🔊' : '🔇'}
            </button>
            <button onClick={() => { analytics.archive({ action: 'open' }); setShowArchive(true) }} aria-label="Archive" className="w-11 h-11 min-w-[44px] min-h-[44px] grid place-items-center rounded-full bg-white border border-black/10 hover:bg-black hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13" /><path d="M4 19a2 2 0 0 0 2 2h12" /><path d="M8 11h8" /><path d="M8 15h5" /></svg>
            </button>
            <button onClick={() => setGameState(s => s === 'playing' ? 'paused' : s)} aria-label="Pause" className="w-11 h-11 min-w-[44px] min-h-[44px] grid place-items-center rounded-full bg-[#FFE03C] border border-black/10 font-extrabold">
              II
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1080px] mx-auto px-4 sm:px-6 pb-[max(3rem,env(safe-area-inset-bottom))]">

        {/* Legal / help pages */}
        {docView ? (
          <DocsPage doc={docView} onBack={closeDoc} />
        ) : (
        <>
        {gameState === 'start' && (
          <div className="pt-4 sm:pt-10">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 sm:gap-8 items-start">
              <div>
                <h1 className="font-display text-[40px] sm:text-[64px] lg:text-[72px] leading-[0.85] tracking-[-0.04em] mt-2 sm:mt-4">
                  GUESS<br />
                  <span className="relative inline-block">
                    <span className="relative z-10">OF THE DAY</span>
                    <span className="absolute inset-x-[-6px] bottom-[8px] h-[18px] bg-[#FFE03C] -rotate-[1deg] -z-0" />
                  </span>
                </h1>
                <p className="mt-4 text-[16px] sm:text-[18px] leading-relaxed text-black/70 max-w-[560px] font-medium">
                  A hidden answer. Tap <span className="font-bold text-black underline decoration-[#FFE03C] decoration-4 underline-offset-2">yes/no chips</span> and the pool visibly shrinks. Guess in the fewest taps.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={startDaily} className="group flex items-center gap-3 bg-black text-white rounded-full px-7 h-[54px] font-extrabold text-[16px] tracking-tight hover:bg-[#1A1A1A] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]">
                    PLAY TODAY'S PUZZLE
                    <span className="w-8 h-8 rounded-full bg-[#FFE03C] text-black grid place-items-center group-hover:rotate-12 transition-transform">→</span>
                  </button>
                  <button onClick={startPractice} className="h-[54px] px-6 rounded-full bg-white border-2 border-black font-extrabold text-[14px] hover:bg-black hover:text-white transition-colors">PRACTICE RANDOM</button>
                  <button onClick={() => setShowHowTo(true)} className="h-[54px] px-5 rounded-full bg-white border-2 border-black font-extrabold text-[13px] hover:bg-black hover:text-white transition-colors">HOW TO PLAY</button>
                </div>

                  <div className="mt-7 hidden md:grid grid-cols-3 gap-3 max-w-[520px]">
                  {[
                    { n: '1', t: 'Ask a chip', d: 'Tap any question. Instant yes/no.' },
                    { n: '2', t: 'Pool shrinks', d: 'Candidates fade in real-time.' },
                    { n: '3', t: 'Make the call', d: 'At ≤5 remaining, guess.' },
                  ].map(s => (
                    <div key={s.n} className="bg-white border border-black/10 rounded-2xl p-3 sm:p-4">
                      <div className="w-7 h-7 rounded-full bg-black text-white grid place-items-center text-[12px] font-black">{s.n}</div>
                      <div className="font-extrabold text-[13px] mt-2 leading-tight">{s.t}</div>
                      <div className="text-[12px] leading-snug text-black/60 mt-1">{s.d}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-[12px] font-bold">
                  <span className="bg-[#FFE03C] border border-black rounded-full px-3 py-1.5">BEST: {best !== null ? `${best} TAPS` : '- PLAY TO SET'}</span>
                  <span className="bg-white border border-black/10 rounded-full px-3 py-1.5 hidden sm:flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {pool.length} ANSWERS • RANKED BY 50/50 SPLIT</span>
                </div>

                {/* Countdown to next puzzle */}
                {best !== null && countdown && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-white border border-black/10 rounded-full px-4 py-2 text-[12px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                    NEXT PUZZLE IN <span className="font-mono2 tabular-nums">{countdown}</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[24px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden pop">
                <div className="bg-black text-white px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[12px] font-black tracking-[0.14em]">
                    <span className="w-2 h-2 rounded-full bg-[#FFE03C] animate-pulse" /> TODAY • {getDailyCategory(today).label}
                  </div>
                  <div className="text-[11px] font-mono2 bg-white/10 rounded-full px-2.5 py-1 border border-white/15">{formatDay(today)} • #{puzzleNumber(today)}</div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-[12px] font-black tracking-[0.12em] text-black/50">POSSIBLE ANSWERS</div>
                    <div className="text-[12px] font-black bg-black text-white rounded-full px-2.5 py-1">{totalPool} TOTAL</div>
                  </div>

                  <div className="mt-3 grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-6 gap-2">
                    {pool.slice(0, 18).map(a => (
                      <div key={a.id} className="aspect-square rounded-xl border border-black/10 grid place-items-center text-[20px] bg-[#FFF8E8] overflow-hidden"><Glyph a={a} size={18} /></div>
                    ))}
                    <div className="aspect-square rounded-xl border-2 border-dashed border-black/15 grid place-items-center text-[10px] font-black">+{pool.length - 18}</div>
                  </div>

                  <div className="mt-4 bg-[#FFFBF0] border border-black/10 rounded-2xl p-3">
                    <div className="text-[11px] font-black tracking-[0.1em] text-black/50">EXAMPLE CHIPS</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getDailyCategory(today).sampleChips.map(t => (
                        <span key={t} className="text-[13px] font-bold bg-white border border-black/10 rounded-full px-3 py-1.5">{t}</span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-black/60">
                      <span className="w-2 h-2 rounded-full bg-amber-400 border border-black/20" /> Low-signal chips are marked. Skip or take the risk.
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 divide-x divide-black/10 bg-[#F7F7F7] rounded-2xl border border-black/10 overflow-hidden text-center">
                    <div className="py-3"><div className="font-display text-[20px] leading-none">{Object.keys(history).length > 0 ? `${Math.round((Object.values(history).filter(v => v.won).length / Object.keys(history).length) * 100)}%` : '–'}</div><div className="text-[10px] font-black tracking-widest text-black/50">COMPLETION</div></div>
                    <div className="py-3"><div className="font-display text-[20px] leading-none">{streak.count || 0}🔥</div><div className="text-[10px] font-black tracking-widest text-black/50">STREAK</div></div>
                    <div className="py-3"><div className="font-display text-[20px] leading-none">{Object.keys(history).length}</div><div className="text-[10px] font-black tracking-widest text-black/50">PLAYED</div></div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button onClick={startDaily} className="w-full h-[48px] rounded-full bg-[#FFE03C] border-2 border-black font-black text-[14px] flex items-center justify-center gap-2 hover:translate-y-[-1px] transition-transform">
                    TAP TO START <span>→</span>
                  </button>
                  <div className="text-center text-[11px] font-bold tracking-wide text-black/50 mt-2">No account • No typing • One tap per question</div>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 bg-white rounded-[20px] border border-black/10 p-3 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="font-extrabold text-[12px] sm:text-[13px] tracking-[0.1em]">RECENT PUZZLES</div>
                <button onClick={() => { analytics.archive({ action: 'open' }); setShowArchive(true) }} className="text-[12px] sm:text-[13px] font-black underline decoration-2">VIEW ARCHIVE →</button>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
                {archiveDates.map(d => {
                  const played = history[d]
                  const isToday = d === today
                  return (
                    <button key={d} onClick={() => startArchiveDate(d)} className={`text-left rounded-2xl border p-3 min-w-[120px] snap-start shrink-0 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[0.5px] transition-all ${isToday ? 'bg-black text-white border-black' : 'bg-[#FFFBF0] border-black/10'} ${played ? 'opacity-100' : ''}`}>
                      <div className={`text-[10px] font-black tracking-widest ${isToday ? 'text-white/60' : 'text-black/50'}`}>{isToday ? 'TODAY' : formatDay(d).split(',')[0]}</div>
                      <div className="font-extrabold text-[12px]">{d.slice(5)}</div>
                      <div className="font-black text-[9px] tracking-widest opacity-60">{getDailyCategory(d).label}</div>
                      <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-black rounded-full px-2 py-0.5 ${played ? (played.won ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-white text-black border border-black/10'}`}>
                        {played ? (played.won ? `✓ ${played.taps}t` : '✕') : 'Play →'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-black text-white rounded-[20px] p-5 sm:p-6 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-[#FFE03C] opacity-20 blur-2xl" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFE03C] text-black grid place-items-center font-black">♛</div>
                  <div>
                    <div className="font-display text-[18px] leading-none">LOCAL HIGH SCORES</div>
                    <div className="text-[12px] font-bold tracking-wide text-white/60">Lowest taps wins • Stored on this device</div>
                  </div>
                  <div className="ml-auto hidden sm:flex items-center gap-2 text-[11px] font-mono2 bg-white/10 rounded-full px-3 py-1 border border-white/10">SEASON 1 • {CATEGORIES.length} CATEGORIES</div>
                </div>
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(() => {
                    const entries = Object.entries(history).filter(([, v]) => v.won).sort((a, b) => a[1].taps - b[1].taps).slice(0, 5)
                    if (entries.length === 0) {
                      return Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white/10 border border-white/10 rounded-2xl p-3 text-center">
                          <div className="text-[11px] font-black tracking-widest text-white/50">#{i + 1}</div>
                          <div className="font-black text-white/30 text-[13px] mt-1">-</div>
                          <div className="text-[11px] text-white/40">No score</div>
                        </div>
                      ))
                    }
                    return entries.map(([date, v], i) => (
                      <div key={date} className={`rounded-2xl p-3 text-center border ${i === 0 ? 'bg-[#FFE03C] text-black border-black' : 'bg-white text-black'}`}>
                        <div className="text-[11px] font-black tracking-widest opacity-60">#{i + 1}</div>
                        <div className="font-display text-[18px] leading-none">{v.taps}</div>
                        <div className="text-[11px] font-bold">TAPS</div>
                        <div className="text-[10px] font-mono2 opacity-60 mt-1">{date.slice(5)}</div>
                      </div>
                    ))
                  })()}
                </div>
                <div className="mt-4 text-[11px] font-bold text-white/60">Pro tip: Solve in 3 taps to earn the ⚡️ Lightning badge. Use number keys 1-6 to fire chips.</div>
              </div>

              <div className="bg-white rounded-[20px] border border-black/10 p-5 hidden lg:block">
                <div className="font-extrabold text-[13px] tracking-[0.1em]">HOW RANKING WORKS</div>
                <p className="text-[13px] leading-relaxed text-black/70 mt-2 font-medium">No AI. Each chip’s value is <span className="font-bold text-black">how close its yes/no split is to 50/50</span> among remaining answers. The closer to 50/50, the higher it ranks.</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-black/10 overflow-hidden"><div className="h-full w-[92%] bg-emerald-500" /></div>
                  <span className="text-[11px] font-black">12:12</span>
                </div>
                <div className="text-[11px] font-bold text-black/50 mt-1">High info-gain → surfaced first. Low-signal chips get a dimmed badge.</div>
                <div className="mt-4 flex gap-2">
                  <span className="text-[11px] font-black bg-emerald-500 text-white rounded-full px-2.5 py-1">● Strong split</span>
                  <span className="text-[11px] font-black bg-amber-400 text-black rounded-full px-2.5 py-1">◐ Low-signal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'paused' || gameState === 'won' || gameState === 'lost') && (
          <div className={`pt-4 sm:pt-6 ${shake ? 'shake' : ''} relative`}>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button onClick={() => { if (gameState === 'playing') analytics.abandon({ date: selectedDate, taps, remaining, at: 'exit' }); setGameState('start') }} className="w-9 h-9 rounded-full bg-white border border-black/10 grid place-items-center hover:bg-black hover:text-white transition-colors">←</button>
              <div className="flex items-center gap-2 bg-black text-white rounded-full px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FFE03C] animate-pulse" />
                <span className="text-[12px] font-black tracking-[0.08em]">{practiceMode ? 'PRACTICE' : 'TODAY'} • {category.label}</span>
                <span className="hidden sm:inline text-[11px] font-mono2 bg-white/15 rounded-full px-2 py-0.5">{practiceMode ? 'RANDOM SEED' : `#${puzzleNumber(selectedDate)} • ${formatDay(selectedDate)}`}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white border border-black/10 rounded-full px-3 py-1.5 text-[12px] font-black">
                  <span className="w-6 h-6 rounded-full bg-[#FFE03C] border border-black/10 grid place-items-center">◐</span> {taps} TAPS
                </div>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-[24px] border-2 border-black overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="h-2 w-full bg-black/5 relative overflow-hidden">
                <div className="h-full bg-[#0EA5A4] transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                {lastResult !== null && (
                  <div className={`absolute inset-0 ${lastResult ? 'bg-emerald-400/30' : 'bg-red-400/30'} animate-pulse`} />
                )}
              </div>

              <div className="px-3 sm:px-6 py-3 sm:py-5">
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl grid place-items-center text-white font-black text-[13px] sm:text-[14px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 bg-black">
                        {remaining}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-[10px] tracking-[0.14em] text-black/50">CANDIDATES</div>
                        <div className="font-display text-[15px] sm:text-[22px] leading-none tracking-tight truncate">
                          {remaining === totalPool ? `All ${totalPool} in play` : remaining <= 5 ? 'Guess ready!' : `${remaining}/${totalPool}`}
                        </div>
                      </div>
                    </div>

                  </div>

                {/* Scrollable pool constrained to viewport height so chips stay visible */}
                <div className="mt-3 sm:mt-4 block max-h-[45dvh] lg:max-h-[55dvh] overflow-y-auto scrollbar-none rounded-xl">
                <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 gap-1.5 sm:gap-2 relative">
                  {pool.map(a => {
                    if (vanishedIds.has(a.id)) return null

                    const isRemaining = candidates.some(c => c.id === a.id)
                    const isEliminated = eliminatedIds.has(a.id)
                    const isWrong = wrongGuessId === a.id

                    return (
                      <div
                        key={a.id}
                        className={`relative aspect-square rounded-2xl border-2 grid place-items-center overflow-hidden grid-fade select-none
                          ${isRemaining ? 'bg-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-100' : 'bg-black/[0.04] border-black/10 scale-[0.92] opacity-40 grayscale'}
                          ${isWrong ? 'shake !border-red-500 !bg-red-50' : ''}
                        `}
                        style={{ backgroundColor: isRemaining ? a.color : undefined }}
                      >
                        <div className="leading-none pb-5 flex items-center justify-center"><Glyph a={a} size={44} rounded="rounded-xl" /></div>
                        <div className={`absolute bottom-0 inset-x-0 text-[8px] sm:text-[9px] font-black tracking-widest text-center py-1 truncate px-0.5 ${isRemaining ? 'bg-black text-white' : 'bg-black/10 text-black/50'}`}>{a.label.toUpperCase()}</div>
                        {!isRemaining && (
                          <div className="absolute inset-0 grid place-items-center">
                            <div className="w-full h-[2px] bg-black/20 rotate-45 absolute" />
                            <div className="w-5 h-5 rounded-full bg-black text-white grid place-items-center text-[9px] font-black">✕</div>
                          </div>
                        )}
                        {isEliminated && isRemaining === false && <div className="absolute inset-0 bg-white/40 backdrop-blur-[0.5px]" />}
                      </div>
                    )
                  })}
                  {particles.map(p => (
                    <div key={p.id} className="absolute w-2 h-2 rounded-full bg-[#FFE03C] border border-black pointer-events-none float" style={{ left: `${p.x}%`, top: `${p.y}%` }} />
                  ))}
                </div>
                </div>

                {asked.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {asked.map((a, i) => (
                      <div key={i} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold border-2 ${a.result ? 'bg-emerald-500 text-white border-black' : 'bg-white text-black border-black/15 line-through decoration-2'}`}>
                        <span className={`w-5 h-5 rounded-full grid place-items-center text-[11px] ${a.result ? 'bg-white text-emerald-600' : 'bg-black text-white'}`}>{a.result ? '✓' : '✕'}</span>
                        {a.text}
                        <span className={`text-[10px] font-black tracking-widest rounded-full px-1.5 py-0.5 ${a.result ? 'bg-white text-emerald-600' : 'bg-black text-white'}`}>{a.result ? 'YES' : 'NO'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div id="guess-section" className="mt-5 grid lg:grid-cols-[1.1fr_0.9fr] gap-5 items-start">
              <div className="bg-[#FFE03C] rounded-[24px] border-2 border-black p-4 sm:p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between">
                  <div className="font-display text-[16px] sm:text-[18px] leading-none tracking-tight">ASK A QUESTION</div>
                  <div className="text-[9px] sm:text-[11px] font-black tracking-widest bg-black text-white rounded-full px-2.5 py-1">{rankedChips.length} CHIPS</div>
                </div>
                <div className="text-[10px] sm:text-[11px] font-black tracking-wide text-black/70 mt-1 uppercase">
                  {remaining <= 5 
                    ? '★ GUESS PANEL UNLOCKED — CHOOSE CAREFULLY' 
                    : asked.length === 0 
                    ? '👇 TAP A QUESTION CHIP BELOW TO NARROW THE POOL' 
                    : 'KEEP TAPPING CHIPS UNTIL ≤5 CANDIDATES REMAIN'}
                </div>

                <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {rankedChips.map(({ chip }, idx) => (
                    <button
                      key={chip.id}
                      onClick={() => handleChipTap(chip)}
                      disabled={!!chipPending}
                      className={`group relative text-left bg-white rounded-xl sm:rounded-2xl border-2 border-black p-2 sm:p-3.5 flex items-center gap-1.5 sm:gap-3 min-h-[52px] sm:min-h-[56px] hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-wait ${chipPending === chip.id ? 'animate-pulse' : ''} ${asked.length === 0 && idx === 0 && gameState === 'playing' ? 'ring-2 ring-black ring-offset-2 animate-bounce' : ''}`}
                    >
                      <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black text-white grid place-items-center text-[10px] sm:text-[11px] font-black shrink-0">{chipPending === chip.id ? '…' : idx + 1}</span>
                      <span className="font-extrabold text-[11px] sm:text-[14px] leading-[1.1] flex-1 line-clamp-2">{chip.text}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex justify-end text-[10px] sm:text-[11px] font-bold">
                  <button onClick={giveUp} className="underline decoration-2 text-black/60 hover:text-black">Give up & reveal →</button>
                </div>
              </div>

              <div className={`rounded-[24px] border-2 p-4 sm:p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${remaining <= 5 ? 'bg-[#0EA5A4] border-black text-white' : 'bg-white border-black/15 text-black'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl grid place-items-center font-black border-2 border-black ${remaining <= 5 ? 'bg-white text-black' : 'bg-black/10 text-black/30'}`}>{remaining <= 5 ? '★' : '?'}</div>
                  <div>
                    <div className={`font-display text-[18px] leading-none ${remaining <= 5 ? 'text-white' : 'text-black'}`}>{remaining <= 5 ? 'MAKE A GUESS' : 'KEEP NARROWING'}</div>
                    <div className={`text-[11px] font-black tracking-widest ${remaining <= 5 ? 'text-white/70' : 'text-black/40'}`}>{remaining <= 5 ? `${remaining} CANDIDATES • CHOOSE ONE` : `UNLOCKS AT ≤5 • NOW ${remaining}`}</div>
                  </div>
                  {remaining <= 5 && <span className="ml-auto bg-[#FFE03C] text-black text-[11px] font-black rounded-full px-2.5 py-1 border border-black animate-pulse">READY</span>}
                </div>

                {remaining <= 5 ? (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5">
                    {candidates.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleGuess(c)}
                        className={`group relative bg-white text-black rounded-2xl border-2 border-black p-3 flex flex-col items-center gap-1 hover:scale-[1.02] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-[0.98] transition-all ${wrongGuessId === c.id ? 'bg-red-50 border-red-500' : ''}`}
                      >
                        <span className="leading-none h-[30px] grid place-items-center"><Glyph a={c} size={26} /></span>
                        <span className="font-extrabold text-[13px] text-center leading-tight">{c.label}</span>
                        <span className="text-[10px] font-bold tracking-widest bg-black text-white rounded-full px-2 py-0.5">GUESS →</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="bg-black/5 border border-black/10 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[12px] sm:text-[13px] font-bold text-black/60">Narrow the pool to guess.</div>
                        <div className="text-[10px] sm:text-[11px] font-mono2 text-black/40">{remaining} → 5 to unlock</div>
                      </div>
                      <div className="flex justify-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-black/20 ${i < Math.max(0, 5 - remaining) ? 'bg-black' : 'bg-white'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {remaining <= 5 && (() => {
                  // Show predicted lives if not yet guessed, actual lives once tracking started
                  const livesTotal = maxWrongGuesses ?? (candidates.length >= 4 ? 2 : 1)
                  const livesLeft = livesTotal - wrongGuessesUsed
                  return (
                    <div className="mt-4 flex items-center justify-between gap-3 bg-white/10 rounded-2xl px-4 py-2.5">
                      <div className="text-[11px] font-black tracking-widest text-white/70">LIVES</div>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: livesTotal }).map((_, i) => {
                          const used = i < wrongGuessesUsed
                          return (
                            <div key={i} className={`w-7 h-7 rounded-full border-2 grid place-items-center font-black text-[12px] transition-all ${
                              used ? 'bg-red-500 border-red-400 text-white scale-95' : 'bg-white border-black/20 text-black'
                            }`}>
                              {used ? '✕' : '♥'}
                            </div>
                          )
                        })}
                      </div>
                      <div className={`text-[11px] font-black tracking-wide ${
                        livesLeft === 1 ? 'text-red-300 animate-pulse' : 'text-white/50'
                      }`}>{livesLeft === 1 ? 'LAST LIFE' : `${livesLeft} left`}</div>
                    </div>
                  )
                })()}
              </div>
            </div>

            <div className="mt-4 hidden sm:flex flex-wrap gap-2">
              <div className="flex items-center gap-2 bg-white border border-black/10 rounded-full px-3 py-1.5 text-[12px] font-black">
                <span className="w-7 h-7 rounded-full bg-black text-white grid place-items-center">≡</span> {asked.length} asked
              </div>
              <div className="flex items-center gap-2 bg-white border border-black/10 rounded-full px-3 py-1.5 text-[12px] font-black">
                <span className="w-7 h-7 rounded-full bg-[#FFE03C] border border-black/10 grid place-items-center">◐</span> {remaining}/{totalPool}
              </div>
            </div>

            {gameState === 'paused' && (
              <div className="absolute inset-0 z-30 bg-[#FFFBF0]/80 backdrop-blur-md grid place-items-center p-4">
                <div className="w-full max-w-[440px] bg-white rounded-[24px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-black text-white grid place-items-center mx-auto font-black">II</div>
                  <div className="font-display text-[28px] mt-3">PAUSED</div>
                  <div className="text-[13px] font-bold text-black/60">Your puzzle is safe. Streak and pool are frozen.</div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button onClick={() => setGameState('playing')} className="h-11 rounded-full bg-[#FFE03C] border-2 border-black font-black">RESUME</button>
                    <button onClick={() => { setCandidates([...pool]); setAsked([]); setTaps(0); setEliminatedIds(new Set()); setVanishedIds(new Set()); setGameState('playing') }} className="h-11 rounded-full bg-white border-2 border-black font-black">RESTART</button>
                  </div>
                  <button onClick={() => setGameState('start')} className="mt-3 w-full h-11 rounded-full bg-black text-white font-black">EXIT TO HOME</button>
                </div>
              </div>
            )}

            {(gameState === 'won' || gameState === 'lost') && (
              <div className="absolute inset-0 z-30 bg-[#FFFBF0]/85 backdrop-blur-[6px] grid place-items-start sm:place-items-center p-0 sm:p-4 overflow-auto">
                <div className="w-full max-w-[560px] bg-white rounded-t-[24px] sm:rounded-[24px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mt-auto sm:mt-0 animate-[pop_0.4s_ease]">
                  <div className={`px-6 py-5 text-white relative overflow-hidden ${gameState === 'won' ? 'bg-black' : 'bg-[#FF5A4A]'}`}>
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#FFE03C] rounded-full opacity-20 blur-xl" />
                    <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white rounded-full opacity-10 blur-xl" />
                    <div className="relative">
                      <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-[11px] font-black tracking-widest">
                        {gameState === 'won' ? '🎉 SOLVED' : '🕳️ REVEAL'} • {practiceMode ? 'PRACTICE' : `DAILY #${puzzleNumber(selectedDate)}`}
                      </div>
                      <div className="font-display text-[38px] leading-none tracking-tight mt-3">
                        {gameState === 'won' ? 'YOU GOT IT!' : 'NOT THIS TIME'}
                      </div>
                      <div className="text-[13px] font-bold text-white/70 mt-1">{gameState === 'won' ? `In ${taps} taps • ${guessAttempts} guess${guessAttempts === 1 ? '' : 'es'} • ${score} pts` : `The answer was ${hidden.label}`}</div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-[88px] h-[88px] rounded-[20px] border-2 border-black grid place-items-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden" style={{ backgroundColor: hidden.color }}>
                        <Glyph a={hidden} size={46} rounded="rounded-[6px]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-display text-[26px] leading-none">{hidden.label.toUpperCase()}</div>
                        <div className="text-[13px] font-medium text-black/70 mt-1 leading-snug">{hidden.fact}</div>
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-black bg-[#FFE03C] border border-black rounded-full px-2.5 py-1">
                          <span className="w-2 h-2 rounded-full bg-black" /> {category.label} • {category.id === 'animals' ? (hidden.tags.mammal ? 'MAMMAL' : 'NON-MAMMAL') : category.id === 'countries' ? String(hidden.tags.continent || '').toUpperCase().replace('-', ' ') : String(hidden.tags.industry || hidden.tags.field || '').toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <div className="bg-[#FFFBF0] border border-black/10 rounded-2xl p-3 text-center">
                        <div className="font-display text-[22px] leading-none">{taps}</div>
                        <div className="text-[11px] font-black tracking-widest text-black/50">TAPS</div>
                        <div className={`text-[10px] font-bold mt-1 rounded-full px-2 py-0.5 inline-block ${taps <= 3 ? 'bg-emerald-500 text-white' : taps <= 5 ? 'bg-black text-white' : 'bg-amber-400 text-black'}`}>{taps <= 3 ? '⚡️ LIGHTNING' : taps <= 5 ? '✨ SHARP' : 'SOLID'}</div>
                      </div>
                      <div className="bg-black text-white rounded-2xl p-3 text-center border-2 border-black">
                        <div className="font-display text-[22px] leading-none">{streak.count}</div>
                        <div className="text-[11px] font-black tracking-widest text-white/60">STREAK</div>
                        <div className="text-[10px] font-bold mt-1">🔥 keep it going</div>
                      </div>
                      <div className="bg-white border border-black/10 rounded-2xl p-3 text-center">
                        <div className="font-display text-[22px] leading-none">{best ?? '-'}</div>
                        <div className="text-[11px] font-black tracking-widest text-black/50">BEST</div>
                        <div className="text-[10px] font-bold mt-1">{best !== null && taps <= best ? 'NEW BEST!' : 'lowest taps'}</div>
                      </div>
                    </div>

                    <div className="mt-5 bg-black rounded-2xl p-4 text-white relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#FFE03C] rounded-full opacity-20 blur-xl" />
                      <div className="text-[11px] font-black tracking-[0.14em] text-white/60">SHARE CARD • TAP TO COPY {shareToken ? '✓ VERIFIED' : ''}</div>
                      <pre className="font-mono2 text-[12px] leading-relaxed whitespace-pre-wrap mt-2">{shareText}</pre>
                      <div className="mt-3 flex gap-2">
                        <button onClick={copyShare} className={`flex-1 h-10 rounded-full font-black text-[12px] sm:text-[13px] border-2 flex items-center justify-center gap-2 transition-colors ${copied ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-[#FFE03C] text-black border-black hover:bg-white'}`}>
                          {copied ? '✓ COPIED' : 'COPY →'}
                        </button>
                        <button onClick={() => { if (navigator.share) navigator.share({ text: shareText }).catch(() => {}) }} className="w-10 h-10 rounded-full bg-white text-black grid place-items-center border-2 border-black">↗</button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {/* RESTART disabled for today's daily once won — prevents score inflation */}
                      <button
                        onClick={() => { if (practiceMode || selectedDate !== today || gameState === 'lost') { setAsked([]); setCandidates([...pool]); setTaps(0); setGuessAttempts(0); setMaxWrongGuesses(null); setWrongGuessesUsed(0); setEliminatedIds(new Set()); setVanishedIds(new Set()); setWrongGuessId(null); setShareToken(null); setGameState('playing') } }}
                        disabled={!practiceMode && selectedDate === today && gameState === 'won'}
                        className="h-12 rounded-full bg-white border-2 border-black font-black text-[12px] sm:text-[13px] hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black"
                      >RESTART ↻</button>
                      <button onClick={startPractice} className="h-12 rounded-full bg-black text-white font-black text-[12px] sm:text-[13px] hover:bg-zinc-800 transition-colors">PRACTICE →</button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button onClick={() => setShowArchive(true)} className="h-11 rounded-full bg-[#FFE03C] border-2 border-black font-black text-[13px]">ARCHIVE</button>
                      <button onClick={() => setGameState('start')} className="h-11 rounded-full bg-white border-2 border-black font-black text-[13px]">HOME</button>
                    </div>

                    <div className="mt-2 text-center">
                      <a href={`mailto:mayankjaindd@gmail.com?subject=Issue%20with%20puzzle%20%23${puzzleNumber(selectedDate.startsWith('practice') ? today : selectedDate)}`} className="text-[11px] font-bold text-black/30 hover:text-black/60 transition-colors underline underline-offset-2">Something wrong? Report it →</a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showArchive && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-3 sm:p-4" onClick={() => setShowArchive(false)}>
            <div className="w-full max-w-[720px] bg-[#FFFBF0] rounded-[24px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-h-[92dvh] sm:max-h-[85dvh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="bg-black text-white px-4 sm:px-6 py-4 flex items-center justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <div className="font-display text-[18px] sm:text-[20px] leading-none">ARCHIVE & PRACTICE</div>
                  <div className="text-[11px] sm:text-[12px] font-bold text-white/60 mt-0.5 leading-tight">Play past dailies • Practice never affects streak</div>
                </div>
                <button onClick={() => setShowArchive(false)} className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white text-black grid place-items-center font-black shrink-0">✕</button>
              </div>
              <div className="p-3 sm:p-6 overflow-auto space-y-3 sm:space-y-4">
                <div className="bg-white rounded-2xl border border-black/10 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-[13px]">Jump to practice</div>
                    <div className="text-[12px] sm:text-[13px] text-black/60 font-medium leading-snug mt-0.5">Random category, same chip logic. Warm up without affecting your streak.</div>
                  </div>
                  <button onClick={() => { setShowArchive(false); startPractice() }} className="w-full sm:w-auto sm:ml-auto bg-black text-white rounded-full px-5 h-[44px] min-h-[44px] font-black text-[13px] shrink-0">PRACTICE →</button>
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {archiveDates.map(d => {
                    const ans = getDailyAnswer(d)
                    const cat = getDailyCategory(d)
                    const played = history[d]
                    const isToday = d === today
                    const showAnswer = !!played
                    return (
                      <div key={d} className={`bg-white rounded-2xl border-2 p-3 sm:p-4 flex flex-col gap-2.5 ${isToday ? 'border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'border-black/10'}`}>
                        <div className="flex gap-3">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-black grid place-items-center text-[22px] sm:text-[24px] shrink-0 overflow-hidden" style={{ backgroundColor: showAnswer ? ans.color : '#FFFBF0' }}>{showAnswer ? <Glyph a={ans} size={24} /> : cat.glyph}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[10px] sm:text-[11px] font-black tracking-widest rounded-full px-2 py-0.5 border ${isToday ? 'bg-black text-white border-black' : 'bg-[#FFE03C] text-black border-black'}`}>{isToday ? 'TODAY' : formatDay(d)}</span>
                              <span className="text-[10px] sm:text-[11px] font-mono2 text-black/40">#{puzzleNumber(d)}</span>
                              <span className="text-[9px] sm:text-[10px] font-black tracking-widest bg-black/5 border border-black/10 rounded-full px-2 py-0.5">{cat.label}</span>
                            </div>
                            <div className="font-extrabold text-[13px] sm:text-[14px] leading-tight mt-1">{isToday ? 'Play today’s puzzle' : played ? `Played: ${played.label} • ${played.taps} taps` : 'Not played yet'}</div>
                            <div className="text-[11px] sm:text-[12px] text-black/50 font-medium leading-snug mt-0.5">{played ? (played.won ? '✓ Solved' : '✕ Missed') : `Hidden • ${cat.label}`}</div>
                          </div>
                        </div>
                        <button onClick={() => startArchiveDate(d)} className={`w-full h-[44px] min-h-[44px] rounded-full font-black text-[13px] border-2 ${played ? 'bg-white border-black text-black' : 'bg-black border-black text-white'}`}>
                          {played ? 'Replay →' : 'Play →'}
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Older archive — locked premium gate */}
                {olderArchiveDates.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <span className="text-[11px] font-black tracking-[0.1em] text-black/40">OLDER PUZZLES</span>
                      <span className="text-[10px] font-bold bg-black/5 border border-black/10 rounded-full px-2 py-0.5 text-black/40">PREMIUM — COMING SOON</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {olderArchiveDates.slice(0, 4).map(d => {
                        const cat = getDailyCategory(d)
                        return (
                          <div key={d} className="bg-white/50 rounded-2xl border border-black/5 p-3 sm:p-4 flex items-center gap-3 opacity-60">
                            <div className="w-10 h-10 rounded-xl border border-black/10 grid place-items-center text-[18px] bg-[#FFFBF0] shrink-0">{cat.glyph}</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-extrabold text-[12px] leading-tight">{formatDay(d)}</div>
                              <div className="text-[11px] text-black/40 font-medium">{cat.label}</div>
                            </div>
                            <span className="text-[16px]">🔒</span>
                          </div>
                        )
                      })}
                      {olderArchiveDates.length > 4 && (
                        <div className="sm:col-span-2 text-center text-[11px] font-bold text-black/30 py-2">
                          +{olderArchiveDates.length - 4} more puzzles locked
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        </>
        )}

        <footer className="mt-6 pt-4 border-t border-black/10 pb-2">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] font-bold tracking-wide text-black/40">
            <button onClick={() => openDoc('sitemap')} className="underline underline-offset-2 hover:text-black transition-colors">Sitemap</button>
            <span aria-hidden>•</span>
            <button onClick={() => openDoc('privacy')} className="underline underline-offset-2 hover:text-black transition-colors">Privacy Policy</button>
            <span aria-hidden>•</span>
            <button onClick={() => openDoc('terms')} className="underline underline-offset-2 hover:text-black transition-colors">Terms of Service</button>
            <span aria-hidden>•</span>
            <button onClick={() => openDoc('cookies')} className="underline underline-offset-2 hover:text-black transition-colors">Cookie Policy</button>
            <span aria-hidden>•</span>
            <button onClick={() => openDoc('sale')} className="underline underline-offset-2 hover:text-black transition-colors">Terms of Sale</button>
            <span aria-hidden>•</span>
            <button onClick={() => setShowPrefs(true)} className="underline underline-offset-2 hover:text-black transition-colors">Manage Privacy</button>
          </div>
          <div className="mt-1 text-center text-[10px] font-bold tracking-wide text-black/30">© {new Date().getFullYear()} GUESS OF THE DAY</div>
        </footer>
      </main>

      {gameState === 'won' && particles.length > 0 && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
          {particles.map(p => (
            <div key={p.id} className="absolute w-3 h-3 rounded-sm border border-black confetti" style={{ left: `${p.x}%`, top: `10%`, backgroundColor: ['#FFE03C','#0EA5A4','#FF5A4A','#B8FF4A'][p.id % 4], transform: `rotate(${p.id % 360}deg)` }} />
          ))}
        </div>
      )}

      {/* Near-miss reveal overlay — lives exhausted, show THE ANSWER */}
      {revealPending && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-5 p-6 animate-[fadeIn_0.15s_ease-out]">
          <div className="text-[11px] font-black tracking-[0.2em] text-white/50">THE ANSWER WAS</div>
          <div className="w-32 h-32 rounded-[32px] border-4 border-white/20 grid place-items-center mx-auto shadow-[0_0_80px_rgba(255,255,255,0.1)]"
            style={{ backgroundColor: hidden.color || '#1a1a1a' }}>
            <Glyph a={hidden} size={56} rounded="rounded-xl" />
          </div>
          <div className="font-display text-[36px] sm:text-[44px] leading-none tracking-tight text-white">{hidden.label}</div>
          <div className="text-[13px] font-bold text-white/40">Better luck tomorrow 👀</div>
        </div>
      )}

      {/* How to Play */}
      {showHowTo && (
        <div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={closeHowTo}>
          <div className="w-full max-w-[500px] bg-[#FFFBF0] rounded-[24px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-h-[90dvh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-black text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <div className="font-display text-[20px] leading-none">HOW TO PLAY</div>
                <div className="text-[11px] font-bold text-white/60 mt-1">No typing. No letters. Just tap.</div>
              </div>
              <button onClick={closeHowTo} className="w-10 h-10 rounded-full bg-white text-black grid place-items-center font-black shrink-0">✕</button>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto scrollbar-none">

              {/* Steps */}
              {[
                { n: '1', title: 'One hidden answer', body: 'Each day a single answer from the category is secretly chosen. Your job is to figure out which one.' },
                { n: '2', title: 'Tap yes/no chips', body: 'Chips are plain-language questions. Tap one — you get YES or NO instantly. The pool shrinks in real time.' },
                { n: '3', title: 'Guess when ≤5 remain', body: 'Once 5 or fewer candidates are left, the guess panel unlocks. You have limited lives — wrong guesses use them up.' },
                { n: '4', title: 'Lives depend on pool size', body: 'Start guessing with 4–5 candidates → 2 lives. Start with 2–3 → 1 life. Use them all and the game is over.' },
              ].map(({ n, title, body }) => (
                <div key={n} className="flex gap-3 bg-white border border-black/10 rounded-2xl p-3.5">
                  <div className="w-8 h-8 rounded-full bg-black text-white grid place-items-center font-black text-[12px] shrink-0 mt-0.5">{n}</div>
                  <div>
                    <div className="font-extrabold text-[14px]">{title}</div>
                    <div className="text-[12px] leading-snug text-black/60 font-medium mt-1">{body}</div>
                  </div>
                </div>
              ))}

              <button onClick={closeHowTo} className="w-full h-11 rounded-full bg-[#FFE03C] border-2 border-black font-black text-[13px]">GOT IT →</button>
            </div>
          </div>
        </div>
      )}

      {/* Time Left */}
      {showTimeLeft && (
        <div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={() => setShowTimeLeft(false)}>
          <div className="w-full max-w-[420px] bg-white rounded-[24px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden text-center" onClick={e => e.stopPropagation()}>
            <div className="bg-black text-white px-5 py-4">
              <div className="font-display text-[20px] leading-none">TIME LEFT</div>
              <div className="text-[11px] font-bold text-white/60 mt-1">Until the next daily puzzle</div>
            </div>
            <div className="p-6">
              <div className="font-mono2 text-[40px] leading-none tracking-tight">{countdown || '00:00:00'}</div>
              <div className="mt-2 text-[12px] font-bold text-black/50">A fresh category and answer unlock at local midnight.</div>
              <button onClick={() => setShowTimeLeft(false)} className="mt-5 w-full h-11 rounded-full bg-[#FFE03C] border-2 border-black font-black text-[13px]">CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie consent banner */}
      {showBanner && !docView && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-black text-white px-3 py-2 sm:px-6">
          <div className="max-w-[1080px] mx-auto flex items-center gap-2">
            <p className="flex-1 min-w-0 text-[11px] sm:text-[12px] font-medium leading-snug truncate sm:whitespace-normal">
              🍪 Essential storage + optional analytics.
              {' '}<button onClick={() => openDoc('cookies')} className="underline underline-offset-2 hover:text-[#FFE03C] transition-colors">Details</button>
            </p>
            <button onClick={acceptAllCookies} className="bg-[#FFE03C] text-black font-black rounded-full px-3 sm:px-4 h-9 text-[11px] sm:text-[12px] hover:bg-white transition-colors shrink-0">ACCEPT</button>
            <button onClick={() => setShowPrefs(true)} className="border border-white/40 rounded-full px-3 sm:px-4 h-9 font-bold text-[11px] sm:text-[12px] hover:border-white transition-colors shrink-0">MANAGE</button>
          </div>
        </div>
      )}

      {/* Manage Privacy Preferences modal */}
      {showPrefs && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={() => setShowPrefs(false)}>
          <div className="w-full max-w-[520px] bg-[#FFFBF0] rounded-[24px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-display text-[18px] leading-none">PRIVACY PREFERENCES</div>
                <div className="text-[11px] font-bold text-white/60 mt-1">Choose what we may process. The game works either way.</div>
              </div>
              <button onClick={() => setShowPrefs(false)} className="w-9 h-9 rounded-full bg-white text-black grid place-items-center font-black shrink-0">✕</button>
            </div>
            <div className="p-5 sm:p-6 space-y-3">
              <label className="flex items-center justify-between gap-4 bg-white border border-black/10 rounded-2xl p-4">
                <div>
                  <div className="font-extrabold text-[14px]">Essential storage</div>
                  <div className="text-[12px] text-black/60 font-medium leading-snug">Session, streak and puzzle progress. Required to play.</div>
                </div>
                <span className="text-[10px] font-black bg-black text-white rounded-full px-3 py-1 shrink-0">ALWAYS ON</span>
              </label>
              <label className="flex items-center justify-between gap-4 bg-white border border-black/10 rounded-2xl p-4 cursor-pointer">
                <div>
                  <div className="font-extrabold text-[14px]">Anonymous analytics</div>
                  <div className="text-[12px] text-black/60 font-medium leading-snug">Counts of starts, taps and completions to improve the game.</div>
                </div>
                <input type="checkbox" checked={prefs.analytics} onChange={e => setPrefs(p => ({ ...p, analytics: e.target.checked }))} className="w-5 h-5 accent-black shrink-0" />
              </label>
              <label className="flex items-center justify-between gap-4 bg-white border border-black/10 rounded-2xl p-4 cursor-pointer opacity-60">
                <div>
                  <div className="font-extrabold text-[14px]">Marketing cookies</div>
                  <div className="text-[12px] text-black/60 font-medium leading-snug">Not used today. No ads, no tracking networks. Reserved for the future.</div>
                </div>
                <input type="checkbox" checked={prefs.marketing} onChange={e => setPrefs(p => ({ ...p, marketing: e.target.checked }))} className="w-5 h-5 accent-black shrink-0" disabled />
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={savePrefs} className="flex-1 h-11 rounded-full bg-[#FFE03C] border-2 border-black font-black text-[13px] hover:bg-white transition-colors">SAVE PREFERENCES</button>
                <button onClick={resetPrefs} className="h-11 px-4 rounded-full bg-white border-2 border-black font-black text-[12px] hover:bg-black hover:text-white transition-colors">RESET</button>
              </div>
              <div className="text-center text-[10px] font-bold text-black/40">See the <button onClick={() => { setShowPrefs(false); openDoc('cookies') }} className="underline">Cookie Policy</button> and <button onClick={() => { setShowPrefs(false); openDoc('privacy') }} className="underline">Privacy Policy</button>.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
