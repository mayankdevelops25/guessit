import { useEffect, useMemo, useState } from 'react'
import {
  getDailyAnswer,
  getDailyCategory,
  getCategoryById,
  CATEGORIES,
  flagUrl,
  logoUrl,
  logoFallback,
  figureInitials,
  puzzleNumber,
  formatDay,
  getLocalDay,
  type Answer,
  type ChipDef,
} from '@/lib/content'
import {
  fetchDaily,
  postChip,
  postGuess,
  checkHealth,
  ensureSession,
  fetchState,
  syncState,
  fetchShareToken,
} from '@/lib/api'
import { initAnalytics, analytics } from '@/lib/analytics'
import { initFirebaseAnalytics } from '@/lib/firebase'
import { ensureLocalSessionId } from '@/lib/session'
import DocsPage, { type DocId } from '@/pages/Docs'
import { getConsent, setConsent, hasConsent, revokeConsent } from '@/lib/consent'
import {
  playTap,
  playYes,
  playNo,
  playWin,
  playWrongGuess,
  playGiveUp,
  audioEnabled,
  setAudioEnabled,
} from '@/lib/audio'
import MultiplayerLobby from '@/components/MultiplayerLobby'
import MultiplayerHUD from '@/components/MultiplayerHUD'
import { type RoomState, multiplayer, getStoredPlayerProfile } from '@/lib/multiplayer'

type AskedChip = { id: string; text: string; result: boolean }

/** Convert Unicode emoji string to high-res Twemoji SVG URL */
export function getTwemojiUrl(emoji: string): string {
  try {
    const codePoints: string[] = []
    for (let i = 0; i < emoji.length; i++) {
      const code = emoji.codePointAt(i)
      if (code !== undefined) {
        if (code !== 0xfe0f && code !== 0x200d) {
          codePoints.push(code.toString(16))
        }
        if (code > 0xffff) i++
      }
    }
    const hex = codePoints.join('-')
    if (!hex) return ''
    return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${hex}.svg`
  } catch {
    return ''
  }
}

function WikiGlyph({ a, size, rounded }: { a: Answer; size: number; rounded: string }) {
  const [src, setSrc] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('wiki_img_' + a.wiki)
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (src || !a.wiki) return
    let active = true
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${a.wiki}`)
      .then((r) => r.json())
      .then((d) => {
        if (active && d?.thumbnail?.source) {
          setSrc(d.thumbnail.source)
          try {
            sessionStorage.setItem('wiki_img_' + a.wiki, d.thumbnail.source)
          } catch {}
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [a.wiki, src])

  if (!src) {
    const fs = Math.max(10, Math.round(size * 0.46))
    return (
      <span
        className={`grid place-items-center font-black text-black/80 leading-none ${rounded}`}
        style={{
          width: size,
          height: size,
          fontSize: fs,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,224,60,0.3))',
          border: '1.5px solid rgba(0,0,0,0.15)',
        }}
      >
        {figureInitials(a)}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={`Portrait of ${a.label}`}
      loading="lazy"
      decoding="async"
      width={size}
      height={size}
      className={`${rounded} object-cover shadow-sm border border-black/10`}
      style={{ width: size, height: size, backgroundColor: '#FFFBF0' }}
      onError={(e) => {
        const t = e.currentTarget as HTMLImageElement
        t.onerror = null
        t.style.display = 'none'
        const p = t.parentElement
        if (p) p.innerHTML = `<span style="font-size:${Math.round(size * 0.85)}px">${a.emoji}</span>`
      }}
    />
  )
}

export function Glyph({
  a,
  size = 26,
  rounded = 'rounded-[6px]',
}: {
  a: Answer
  size?: number
  rounded?: string
}) {
  // 1) country flag
  const flag = flagUrl(a, size <= 28 ? 'sm' : 'md')
  if (flag) {
    return (
      <img
        src={flag}
        alt={`Flag of ${a.label}`}
        loading="lazy"
        decoding="async"
        width={Math.round(size * 1.45)}
        height={size}
        className={`${rounded} object-cover shadow-sm border border-black/15`}
        style={{ width: Math.round(size * 1.45), height: size }}
        onError={(e) => {
          const t = e.currentTarget as HTMLImageElement
          t.onerror = null
          t.style.display = 'none'
          const p = t.parentElement
          if (p) p.innerHTML = `<span style="font-size:${size}px">${a.emoji}</span>`
        }}
      />
    )
  }
  // 2) company logo
  const logo = logoUrl(a)
  if (logo) {
    return (
      <div
        className={`bg-white shadow-sm border border-black/10 grid place-items-center ${rounded} p-1`}
        style={{ width: size + 6, height: size + 6 }}
      >
        <img
          src={logo}
          alt={`Logo of ${a.label}`}
          loading="lazy"
          decoding="async"
          width={size}
          height={size}
          className="object-contain"
          style={{ width: size, height: size }}
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement
            const fb = logoFallback(a)
            if (fb && t.src !== fb) {
              t.src = fb
              return
            }
            t.onerror = null
            t.style.display = 'none'
            const p = t.parentElement
            if (p)
              p.innerHTML = `<span style="font-size:${Math.round(size * 0.85)}px">${a.emoji}</span>`
          }}
        />
      </div>
    )
  }
  // 3) historical figure portrait
  if (a.wiki) {
    return <WikiGlyph a={a} size={size} rounded={rounded} />
  }

  // 4) High-definition vector Twemoji SVG with fallback
  const twemoji = getTwemojiUrl(a.emoji)
  if (twemoji) {
    return (
      <img
        src={twemoji}
        alt={a.label}
        loading="lazy"
        decoding="async"
        width={size}
        height={size}
        className="object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)] transition-transform duration-200 hover:scale-110"
        style={{ width: size, height: size }}
        onError={(e) => {
          const t = e.currentTarget as HTMLImageElement
          t.onerror = null
          t.style.display = 'none'
          const p = t.parentElement
          if (p) p.innerHTML = `<span style="font-size:${size}px" class="drop-shadow-sm">${a.emoji}</span>`
        }}
      />
    )
  }

  return (
    <span style={{ fontSize: size, lineHeight: 1 }} className="drop-shadow-md select-none">
      {a.emoji}
    </span>
  )
}

export default function App() {
  const today = getLocalDay()
  const [selectedDate, setSelectedDate] = useState(today)
  const [category, setCategory] = useState(() => getDailyCategory(today))
  const pool = category.answers
  const chipDefs = category.chips
  const [hidden, setHidden] = useState<Answer>(() => getDailyAnswer(today))
  const [candidates, setCandidates] = useState<Answer[]>(() => [
    ...getDailyCategory(today).answers,
  ])
  const [asked, setAsked] = useState<AskedChip[]>([])
  const [taps, setTaps] = useState(0)
  const [guessAttempts, setGuessAttempts] = useState(0)
  const [gameState, setGameState] = useState<
    'start' | 'playing' | 'multiplayer_lobby' | 'multiplayer_playing' | 'paused' | 'won' | 'lost'
  >('start')
  const [homeTab, setHomeTab] = useState<'daily' | 'stats' | 'archive' | 'howto'>('daily')
  const [practiceMode, setPracticeMode] = useState(false)
  const [shake, setShake] = useState(false)
  const [particles, setParticles] = useState<{ x: number; y: number; id: number }[]>([])
  const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(new Set())
  const [vanishedIds, setVanishedIds] = useState<Set<string>>(new Set())
  const [lastResult, setLastResult] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)
  const [wrongGuessId, setWrongGuessId] = useState<string | null>(null)
  const [backendLive, setBackendLive] = useState<boolean | null>(null)
  const [chipPending, setChipPending] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>(() => ensureLocalSessionId())
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [revealPending, setRevealPending] = useState(false)
  const [maxWrongGuesses, setMaxWrongGuesses] = useState<number | null>(null)
  const [wrongGuessesUsed, setWrongGuessesUsed] = useState(0)

  // Multiplayer states
  const [multiplayerRoom, setMultiplayerRoom] = useState<RoomState | null>(null)
  const [myPlayerId, setMyPlayerId] = useState<string>(() => getStoredPlayerProfile().id)
  const [initialRoomParam, setInitialRoomParam] = useState<string>('')

  // Docs & Privacy
  const [docView, setDocView] = useState<DocId | null>(() => {
    const m = window.location.hash.match(/^#\/docs\/(\w+)/)
    if (m && ['sitemap', 'privacy', 'terms', 'cookies', 'sale'].includes(m[1]))
      return m[1] as DocId
    return null
  })
  const [showPrefs, setShowPrefs] = useState(false)
  const [showBanner, setShowBanner] = useState(() => !hasConsent())
  const [prefs, setPrefs] = useState(
    () => getConsent() || { essential: true, analytics: true, marketing: false }
  )
  const [audioOn, setAudioOn] = useState(() => audioEnabled())

  // Countdown timer
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
      setCountdown(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      )
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  // Local storage stats
  const [streak, setStreak] = useState(() => {
    try {
      const s = localStorage.getItem('gotd-streak')
      return s ? JSON.parse(s) : { count: 0, last: null }
    } catch {
      return { count: 0, last: null }
    }
  })
  const [history, setHistory] = useState<
    Record<string, { taps: number; won: boolean; label: string }>
  >(() => {
    try {
      const h = localStorage.getItem('gotd-history')
      return h ? JSON.parse(h) : {}
    } catch {
      return {}
    }
  })
  const [best, setBest] = useState<number | null>(() => {
    try {
      const b = localStorage.getItem('gotd-best')
      return b ? Number(b) : null
    } catch {
      return null
    }
  })
  const [freezeAvailable, setFreezeAvailable] = useState(false)

  const totalPool = pool.length
  const remaining = candidates.length
  const progress = ((totalPool - remaining) / totalPool) * 100

  // Check URL for ?room=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roomCode = params.get('room')
    if (roomCode) {
      setInitialRoomParam(roomCode.toUpperCase())
      setGameState('multiplayer_lobby')
    }
  }, [])

  // Init analytics & session
  useEffect(() => {
    initAnalytics()
    initFirebaseAnalytics()
    ensureSession()
      .then((r) => {
        setSessionId(r.session.id)
        if (r.session.streak) {
          if (r.session.streak.freezeAvailable) setFreezeAvailable(true)
          const srv = r.session.streak
          setStreak((prev: any) => {
            if (srv.lastDate && srv.count > prev.count)
              return { count: srv.count, last: srv.lastDate }
            if (srv.lastDate && !prev.last) return { count: srv.count, last: srv.lastDate }
            return prev
          })
        }
        setBackendLive(true)
      })
      .catch(() => {
        checkHealth()
          .then((h) => setBackendLive(h.ok))
          .catch(() => setBackendLive(false))
      })
    fetchDaily(today).catch(() => {})
  }, [today])

  // Router for legal docs
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

  const goHome = () => {
    if (window.location.hash.startsWith('#/docs')) {
      try {
        window.history.pushState('', document.title, window.location.pathname)
      } catch {
        window.location.hash = ''
      }
    }
    setDocView(null)
    setShowPrefs(false)
    if (gameState === 'playing') {
      analytics.abandon({ date: selectedDate, taps, remaining, at: 'exit' })
    }
    if (gameState === 'multiplayer_playing') {
      multiplayer.cleanup()
    }
    setGameState('start')
  }

  const openDoc = (id: DocId) => {
    window.location.hash = `/docs/${id}`
    setDocView(id)
  }
  const closeDoc = () => {
    if (window.location.hash.startsWith('#/docs')) {
      try {
        window.history.pushState('', document.title, window.location.pathname)
      } catch {
        window.location.hash = ''
      }
    }
    setDocView(null)
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
    if (prefs.analytics) initFirebaseAnalytics().catch(() => {})
  }
  const resetPrefs = () => {
    revokeConsent()
    setPrefs({ essential: true, analytics: true, marketing: false })
    setShowPrefs(false)
    setShowBanner(true)
  }

  // Ranking 50/50 split
  const rankedChips = useMemo(() => {
    const askedIds = new Set(asked.map((a) => a.id))
    const remainingChips = chipDefs.filter((c) => !askedIds.has(c.id))
    const scored = remainingChips.map((chip) => {
      const yes = candidates.filter((a) => chip.check(a)).length
      const no = candidates.length - yes
      const total = candidates.length
      const score = total === 0 ? 0 : 1 - Math.abs(yes - no) / total
      return { chip, score, yes, no }
    })

    const useful = scored.filter((s) => s.yes > 0 && s.no > 0)
    useful.sort((a, b) => b.score - a.score)
    return useful.slice(0, 6)
  }, [candidates, asked, chipDefs])

  // Keyboard shortcuts (1-6 chips, Esc pause)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameState !== 'playing' && gameState !== 'multiplayer_playing') return
      if (e.key >= '1' && e.key <= '6') {
        const idx = Number(e.key) - 1
        const entry = rankedChips[idx]
        if (entry && !chipPending) handleChipTap(entry.chip)
      }
      if (e.key === 'Escape') setGameState((s) => (s === 'paused' ? 'playing' : 'paused'))
      if (e.key.toLowerCase() === 'g' && remaining <= 5) {
        document.getElementById('guess-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [rankedChips, gameState, remaining, chipPending])

  // Persist cache
  useEffect(() => {
    localStorage.setItem('gotd-streak', JSON.stringify(streak))
  }, [streak])
  useEffect(() => {
    localStorage.setItem('gotd-history', JSON.stringify(history))
  }, [history])
  useEffect(() => {
    if (best !== null) localStorage.setItem('gotd-best', String(best))
  }, [best])

  // Single-player Game Start
  const startDaily = async () => {
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

    try {
      await fetchDaily(today)
    } catch {}
    analytics.gameStart({
      date: today,
      category: cat.id,
      puzzleNo: puzzleNumber(today),
      mode: 'daily',
    })
  }

  const startPractice = (catId?: string) => {
    const cat = catId
      ? getCategoryById(catId)
      : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    let h: Answer
    do {
      h = cat.answers[Math.floor(Math.random() * cat.answers.length)]
    } while (h.id === hidden.id)

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
  }

  const startArchiveDate = async (dateStr: string) => {
    const cat = getDailyCategory(dateStr)
    const h = getDailyAnswer(dateStr)
    setCategory(cat)
    setHidden(h)
    setSelectedDate(dateStr)
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
    try {
      await fetchDaily(dateStr)
    } catch {}
  }

  // Multiplayer Game Start callback
  const handleStartMultiplayerGame = (room: RoomState, playerId: string) => {
    setMultiplayerRoom(room)
    setMyPlayerId(playerId)
    const cat = getCategoryById(room.categoryId)
    const ans = cat.answers.find((a) => a.id === room.answerId) || cat.answers[0]

    setCategory(cat)
    setHidden(ans)
    setSelectedDate(`multiplayer-${room.code}`)
    setCandidates([...cat.answers])
    setAsked([])
    setTaps(0)
    setGuessAttempts(0)
    setMaxWrongGuesses(null)
    setWrongGuessesUsed(0)
    setEliminatedIds(new Set())
    setVanishedIds(new Set())
    setLastResult(null)
    setWrongGuessId(null)
    setPracticeMode(true)
    setGameState('multiplayer_playing')
    window.scrollTo(0, 0)

    multiplayer.initRoom(room.code, (st) => {
      setMultiplayerRoom({ ...st })
    })
  }

  const handleRematch = () => {
    if (!multiplayerRoom) return
    const updated = multiplayer.restartRematch()
    if (updated) {
      handleStartMultiplayerGame(updated, myPlayerId)
    }
  }

  // Chip Tap Handler
  const handleChipTap = async (chip: ChipDef) => {
    if ((gameState !== 'playing' && gameState !== 'multiplayer_playing') || chipPending) return
    playTap()
    setChipPending(chip.id)

    let result: boolean
    if (!practiceMode && gameState === 'playing' && backendLive !== false) {
      try {
        const r = await postChip(selectedDate, chip.id)
        result = r.result
      } catch {
        result = chip.check(hidden)
      }
    } else {
      result = chip.check(hidden)
    }

    const newCandidates = candidates.filter((a) => chip.check(a) === result)
    const eliminated = candidates.filter((a) => chip.check(a) !== result).map((a) => a.id)

    setChipPending(null)

    if (result) {
      playYes()
      try {
        navigator.vibrate?.(10)
      } catch {}
    } else {
      playNo()
      try {
        navigator.vibrate?.(25)
      } catch {}
    }

    setShake(true)
    setTimeout(() => setShake(false), 420)
    setLastResult(result)
    setTimeout(() => setLastResult(null), 900)

    const id = Date.now()
    setParticles((p) => [...p, { x: Math.random() * 100, y: Math.random() * 60, id }])
    setTimeout(() => setParticles((p) => p.filter((pt) => pt.id !== id)), 800)

    setTimeout(() => {
      setEliminatedIds((prev) => {
        const s = new Set(prev)
        eliminated.forEach((eId) => s.add(eId))
        return s
      })
    }, 150)

    setTimeout(() => {
      setVanishedIds((prev) => {
        const s = new Set(prev)
        eliminated.forEach((eId) => s.add(eId))
        return s
      })
    }, 650)

    const nextAsked = [...asked, { id: chip.id, text: chip.text, result }]
    const nextTaps = taps + 1
    setAsked(nextAsked)
    setCandidates(newCandidates)
    setTaps(nextTaps)

    if (gameState === 'multiplayer_playing' && multiplayerRoom) {
      multiplayer.updatePlayerProgress(myPlayerId, nextTaps, newCandidates.length, chip.text)
      multiplayer.recordChipAsk(myPlayerId, chip.text, result)
    }

    analytics.chipTap({
      chipId: chip.id,
      chipText: chip.text,
      result,
      remaining: newCandidates.length,
      taps: nextTaps,
    })
  }

  // Guess Handler
  const handleGuess = async (answer: Answer) => {
    if (gameState !== 'playing' && gameState !== 'multiplayer_playing') return

    let isCorrect: boolean
    if (!practiceMode && gameState === 'playing' && backendLive !== false) {
      try {
        const r = await postGuess(selectedDate, answer.id)
        isCorrect = r.correct
      } catch {
        isCorrect = answer.id === hidden.id
      }
    } else {
      isCorrect = answer.id === hidden.id
    }

    if (isCorrect) {
      playWin()
      const tapsUsed = taps
      const isDaily = !practiceMode && !selectedDate.startsWith('practice')

      if (gameState === 'multiplayer_playing' && multiplayerRoom) {
        multiplayer.recordGuessAttempt(myPlayerId, answer.label, true)
      } else {
        setGameState('won')
        setGuessAttempts((a) => a + 1)
        if (isDaily) {
          fetchShareToken(selectedDate)
            .then((r) => {
              if ((r as any).ok) setShareToken((r as any).token)
            })
            .catch(() => {})
          const newHistory = {
            ...history,
            [selectedDate]: { taps: tapsUsed, won: true, label: hidden.label },
          }
          setHistory(newHistory)
          if (best === null || tapsUsed < best) setBest(tapsUsed)
          setStreak((prev: any) => ({ count: prev.count + 1, last: selectedDate }))
        }
      }
    } else {
      playWrongGuess()
      setWrongGuessId(answer.id)
      setTimeout(() => setWrongGuessId(null), 1000)

      if (gameState === 'multiplayer_playing' && multiplayerRoom) {
        multiplayer.recordGuessAttempt(myPlayerId, answer.label, false)
      }

      setWrongGuessesUsed((u) => u + 1)
      const allowedLives = maxWrongGuesses ?? (candidates.length >= 4 ? 2 : 1)
      if (maxWrongGuesses === null) setMaxWrongGuesses(allowedLives)

      if (wrongGuessesUsed + 1 >= allowedLives && gameState !== 'multiplayer_playing') {
        playGiveUp()
        setRevealPending(true)
        setTimeout(() => {
          setRevealPending(false)
          setGameState('lost')
        }, 1800)
      }
    }
  }

  const giveUp = () => {
    playGiveUp()
    setRevealPending(true)
    setTimeout(() => {
      setRevealPending(false)
      setGameState('lost')
    }, 1600)
  }

  const copyShare = () => {
    const grid = asked.map((a) => (a.result ? '🟩' : '🟥')).join('') || '—'
    const catLabel = category.label
    const shareText = `Guess of the Day — Daily #${puzzleNumber(selectedDate)} · ${catLabel}\nSolved in ${taps} taps ${taps <= 3 ? '⚡️' : '✨'}\n${grid}\nStreak: ${streak.count} 🔥\nhttps://guessit-dub.pages.dev`
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const archiveDates = useMemo(() => {
    const dates: string[] = []
    const cur = new Date(today + 'T12:00:00')
    for (let i = 0; i < 14; i++) {
      const d = new Date(cur)
      d.setDate(d.getDate() - i)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      dates.push(`${yyyy}-${mm}-${dd}`)
    }
    return dates
  }, [today])

  return (
    <div className="min-h-screen bg-[#FFFBF0] text-[#0F0F0F] font-sans antialiased selection:bg-[#FFE03C] selection:text-black">
      {/* Global CSS & Visual Effects */}
      <style>{`
        @keyframes pop { 0% { transform: scale(0.96); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .shake { animation: shakeAnim 0.4s ease; }
        @keyframes shakeAnim { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }
        .confetti { animation: confettiFall 0.9s ease-out forwards; }
        @keyframes confettiFall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(220px) rotate(540deg); opacity: 0; } }
        .grid-fade { transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1); }
        @media (min-width: 1024px) { .lg\\:grid-cols-13 { grid-template-columns: repeat(13, minmax(0, 1fr)); } }
        :focus-visible { outline: 2px solid #0F0F0F; outline-offset: 2px; border-radius: 6px; }
        .scrollbar-none { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
      `}</style>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFBF0]/90 backdrop-blur-md border-b border-black/10">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 h-[58px] sm:h-[64px] flex items-center justify-between gap-3">
          <button
            onClick={goHome}
            aria-label="Guess of the Day Home"
            className="flex items-center gap-2.5 text-left hover:opacity-85 transition-opacity focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-black text-white grid place-items-center font-display text-[19px] leading-none tracking-tight shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              G<span className="text-[#FFE03C]">.</span>
            </div>
            <div>
              <div className="font-display text-[17px] sm:text-[19px] leading-none tracking-tight">
                GUESS OF THE DAY
              </div>
              <div className="text-[10px] font-bold tracking-[0.12em] text-black/50 hidden xs:block">
                DEDUCTION & MULTIPLAYER
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* Streak Badge */}
            <div className="relative group">
              <button
                onClick={() => {
                  setHomeTab('stats')
                  if (gameState !== 'start') setGameState('start')
                }}
                className="flex items-center gap-1.5 bg-black text-white rounded-full px-3 py-1.5 h-9 text-[12px] font-extrabold cursor-pointer hover:bg-neutral-800 transition-colors"
                title={`Current Streak: ${streak.count} days`}
              >
                <span className="text-[#FFE03C]">🔥</span> {streak.count}
                <span className="hidden sm:inline text-[10px] font-bold text-white/70">
                  STREAK
                </span>
              </button>
              {freezeAvailable && streak.count > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#0EA5A4] border-2 border-white rounded-full"
                  title="Streak Freeze Available"
                />
              )}
            </div>

            {/* Multiplayer Quick Switch */}
            <button
              onClick={() => setGameState('multiplayer_lobby')}
              className="h-9 px-3 rounded-full bg-[#FFE03C] border border-black text-[12px] font-extrabold flex items-center gap-1.5 hover:bg-[#FFD700] transition-colors cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              title="Play Multiplayer"
            >
              <span>⚔️</span>
              <span className="hidden sm:inline">DUEL</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                const v = !audioOn
                setAudioOn(v)
                setAudioEnabled(v)
              }}
              className="w-9 h-9 rounded-full bg-white border border-black/15 grid place-items-center text-[15px] hover:border-black transition-colors cursor-pointer"
              title={audioOn ? 'Sound On' : 'Sound Muted'}
            >
              {audioOn ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1080px] mx-auto px-4 sm:px-6 pb-12">
        {/* Legal Docs Router */}
        {docView ? (
          <DocsPage doc={docView} onBack={closeDoc} />
        ) : gameState === 'multiplayer_lobby' ? (
          /* Multiplayer Lobby View */
          <MultiplayerLobby
            initialRoomCode={initialRoomParam}
            onStartMultiplayerGame={handleStartMultiplayerGame}
            onBack={goHome}
          />
        ) : gameState === 'start' ? (
          /* ── DECLUTTERED & MODERN HOMEPAGE ── */
          <div className="pt-6 sm:pt-10 max-w-[960px] mx-auto">
            {/* Clean Hero */}
            <div className="text-center max-w-[680px] mx-auto">
              <div className="inline-flex items-center gap-2 bg-[#FFE03C] border border-black rounded-full px-4 py-1.5 text-[11px] font-black tracking-wider uppercase mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span>🎯</span> DAILY DEDUCTION • {CATEGORIES.length} CATEGORIES
              </div>

              <h1 className="font-display text-[44px] sm:text-[68px] leading-[0.92] tracking-[-0.03em]">
                GUESS THE{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">SECRET</span>
                  <span className="absolute inset-x-[-4px] bottom-[4px] sm:bottom-[8px] h-[16px] sm:h-[22px] bg-[#FFE03C] -rotate-[1deg] -z-0" />
                </span>
              </h1>

              <p className="mt-4 text-[15px] sm:text-[17px] text-black/70 font-medium leading-relaxed max-w-[560px] mx-auto">
                Tap plain yes/no question chips to shrink the pool. Narrow it down and guess in the fewest taps — solo or against friends!
              </p>
            </div>

            {/* ── 3 PRIMARY GAME MODE CARDS ── */}
            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {/* Card 1: Daily Puzzle */}
              <div className="bg-white rounded-[24px] border-2 border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black bg-black text-white px-3 py-1 rounded-full uppercase tracking-wider">
                      DAILY #{puzzleNumber(today)}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-[#FFFBF0] border border-black/10 grid place-items-center shadow-sm">
                      <img
                        src={getTwemojiUrl(getDailyCategory(today).glyph)}
                        alt={getDailyCategory(today).label}
                        className="w-5 h-5 object-contain"
                      />
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="text-[12px] font-black text-black/50 uppercase tracking-wider">
                      TODAY'S CATEGORY
                    </div>
                    <div className="font-display text-[24px] tracking-tight mt-0.5">
                      {getDailyCategory(today).label}
                    </div>
                    <p className="text-[12px] text-black/60 font-medium mt-1">
                      {getDailyCategory(today).blurb} ({getDailyCategory(today).answers.length} items)
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-black/10">
                  {history[today] ? (
                    <div className="bg-emerald-50 border border-emerald-400 rounded-xl p-2.5 text-center text-[12px] font-bold text-emerald-800 mb-2">
                      ✓ Solved in {history[today].taps} taps!
                    </div>
                  ) : null}
                  <button
                    onClick={startDaily}
                    className="w-full h-12 rounded-full bg-black text-white font-extrabold text-[14px] flex items-center justify-center gap-2 hover:bg-[#222] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] cursor-pointer"
                  >
                    {history[today] ? 'REPLAY TODAY' : "PLAY TODAY'S PUZZLE"} <span>→</span>
                  </button>
                  {countdown && (
                    <div className="text-center text-[10px] font-bold text-black/50 mt-2">
                      Next daily in <span className="font-mono font-black">{countdown}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Multiplayer Duel */}
              <div className="bg-[#FFF8E8] rounded-[24px] border-2 border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black bg-[#FFE03C] border border-black px-3 py-1 rounded-full uppercase tracking-wider">
                      🔥 NEW MULTIPLAYER
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white border border-black/10 grid place-items-center shadow-sm">
                      <img
                        src={getTwemojiUrl('⚔️')}
                        alt="Duel"
                        className="w-5 h-5 object-contain"
                      />
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="text-[12px] font-black text-black/50 uppercase tracking-wider">
                      1v1 DUEL ARENA
                    </div>
                    <div className="font-display text-[24px] tracking-tight mt-0.5">
                      RACE OR CO-OP
                    </div>
                    <p className="text-[12px] text-black/60 font-medium mt-1">
                      Play live speed races or turn-based duels against friends with private room codes!
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-black/10">
                  <button
                    onClick={() => setGameState('multiplayer_lobby')}
                    className="w-full h-12 rounded-full bg-[#FFE03C] border-2 border-black font-extrabold text-[14px] flex items-center justify-center gap-2 hover:bg-[#FFD700] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  >
                    PLAY MULTIPLAYER <span>⚔️</span>
                  </button>
                  <div className="text-center text-[10px] font-bold text-black/50 mt-2">
                    Instant room codes • No sign-up needed
                  </div>
                </div>
              </div>

              {/* Card 3: Solo Practice & All Categories */}
              <div className="bg-white rounded-[24px] border-2 border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black bg-white border border-black/20 px-3 py-1 rounded-full uppercase tracking-wider">
                      FREE PRACTICE
                    </span>
                    <span className="w-8 h-8 rounded-full bg-[#FFFBF0] border border-black/10 grid place-items-center shadow-sm">
                      <img
                        src={getTwemojiUrl('🎯')}
                        alt="Practice"
                        className="w-5 h-5 object-contain"
                      />
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="text-[12px] font-black text-black/50 uppercase tracking-wider">
                      ANY CATEGORY
                    </div>
                    <div className="font-display text-[24px] tracking-tight mt-0.5">
                      UNLIMITED PLAY
                    </div>
                    <p className="text-[12px] text-black/60 font-medium mt-1">
                      Explore all 8 categories (Movies, Games, Food, Wonders & more) without affecting streaks.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-black/10">
                  <button
                    onClick={() => startPractice()}
                    className="w-full h-12 rounded-full bg-white border-2 border-black font-extrabold text-[14px] flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    PRACTICE RANDOM <span>🎲</span>
                  </button>
                  <div className="text-center text-[10px] font-bold text-black/50 mt-2">
                    510+ answers in database
                  </div>
                </div>
              </div>
            </div>

            {/* ── TABBED EXPLORATION PANEL (Stats / Archive / How to Play) ── */}
            <div className="mt-8 bg-white rounded-[24px] border-2 border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              {/* Tab Selector Header */}
              <div className="flex flex-wrap items-center gap-2 border-b border-black/10 pb-4">
                <button
                  onClick={() => setHomeTab('daily')}
                  className={`px-4 py-2 rounded-full font-extrabold text-[13px] transition-all cursor-pointer ${
                    homeTab === 'daily'
                      ? 'bg-black text-white'
                      : 'bg-[#FFFBF0] border border-black/15 text-black/70 hover:text-black'
                  }`}
                >
                  🌟 Explore Categories ({CATEGORIES.length})
                </button>
                <button
                  onClick={() => setHomeTab('stats')}
                  className={`px-4 py-2 rounded-full font-extrabold text-[13px] transition-all cursor-pointer ${
                    homeTab === 'stats'
                      ? 'bg-black text-white'
                      : 'bg-[#FFFBF0] border border-black/15 text-black/70 hover:text-black'
                  }`}
                >
                  📊 Stats & High Scores
                </button>
                <button
                  onClick={() => setHomeTab('archive')}
                  className={`px-4 py-2 rounded-full font-extrabold text-[13px] transition-all cursor-pointer ${
                    homeTab === 'archive'
                      ? 'bg-black text-white'
                      : 'bg-[#FFFBF0] border border-black/15 text-black/70 hover:text-black'
                  }`}
                >
                  📅 Past Daily Archive
                </button>
                <button
                  onClick={() => setHomeTab('howto')}
                  className={`px-4 py-2 rounded-full font-extrabold text-[13px] transition-all cursor-pointer ${
                    homeTab === 'howto'
                      ? 'bg-black text-white'
                      : 'bg-[#FFFBF0] border border-black/15 text-black/70 hover:text-black'
                  }`}
                >
                  ℹ️ Rules & Ranking
                </button>
              </div>

              {/* Tab 1: Category Showcase */}
              {homeTab === 'daily' && (
                <div className="pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => startPractice(cat.id)}
                        className="p-3.5 rounded-2xl bg-[#FFFBF0] border border-black/15 text-left hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white border border-black/10 grid place-items-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                          <img
                            src={getTwemojiUrl(cat.glyph)}
                            alt={cat.label}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <div className="font-extrabold text-[13px] truncate">{cat.label}</div>
                        <div className="text-[11px] text-black/50 mt-0.5">
                          {cat.answers.length} items • Play →
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Stats & High Scores */}
              {homeTab === 'stats' && (
                <div className="pt-4">
                  <div className="grid sm:grid-cols-3 gap-3 mb-4 text-center">
                    <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-black/10">
                      <div className="font-display text-[32px] leading-none text-black">
                        {streak.count}🔥
                      </div>
                      <div className="text-[11px] font-black text-black/50 uppercase mt-1">
                        CURRENT STREAK
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-black/10">
                      <div className="font-display text-[32px] leading-none text-black">
                        {best !== null ? `${best} Taps` : '—'}
                      </div>
                      <div className="text-[11px] font-black text-black/50 uppercase mt-1">
                        PERSONAL BEST
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-black/10">
                      <div className="font-display text-[32px] leading-none text-black">
                        {Object.keys(history).length}
                      </div>
                      <div className="text-[11px] font-black text-black/50 uppercase mt-1">
                        PUZZLES PLAYED
                      </div>
                    </div>
                  </div>

                  {Object.keys(history).length > 0 && (
                    <div className="border-t border-black/10 pt-3">
                      <div className="text-[12px] font-black text-black/50 uppercase mb-2">
                        RECENT MATCH HISTORY
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(history)
                          .slice(-6)
                          .map(([d, h]) => (
                            <span
                              key={d}
                              className="text-[12px] font-bold bg-[#FFFBF0] border border-black/15 px-3 py-1 rounded-full"
                            >
                              {d.slice(5)}: {h.label} ({h.taps} taps) {h.won ? '✓' : '✕'}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Daily Archive */}
              {homeTab === 'archive' && (
                <div className="pt-4">
                  <div className="grid sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                    {archiveDates.map((d) => {
                      const cat = getDailyCategory(d)
                      const played = history[d]
                      const isToday = d === today
                      return (
                        <div
                          key={d}
                          className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 ${
                            isToday ? 'bg-[#FFE03C]/20 border-black' : 'bg-[#FFFBF0] border-black/15'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-white border border-black/10 grid place-items-center shrink-0">
                              <img
                                src={getTwemojiUrl(cat.glyph)}
                                alt={cat.label}
                                className="w-5 h-5 object-contain"
                              />
                            </span>
                            <div className="min-w-0">
                              <div className="font-extrabold text-[13px] truncate">
                                {isToday ? 'TODAY' : formatDay(d)} • {cat.label}
                              </div>
                              <div className="text-[11px] text-black/50">
                                {played ? (played.won ? `✓ Solved in ${played.taps}t` : '✕ Missed') : 'Not played'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => startArchiveDate(d)}
                            className="px-3.5 py-1.5 rounded-full bg-black text-white font-extrabold text-[12px] hover:bg-[#222] transition-colors shrink-0 cursor-pointer"
                          >
                            Play →
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tab 4: Rules & Ranking Engine */}
              {homeTab === 'howto' && (
                <div className="pt-4 space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-black/10">
                      <div className="w-8 h-8 rounded-full bg-black text-white grid place-items-center font-black text-[13px]">
                        1
                      </div>
                      <div className="font-extrabold text-[14px] mt-2">Ask a Question Chip</div>
                      <div className="text-[12px] text-black/60 mt-1">
                        Tap any yes/no question chip. Answers resolve instantly.
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-black/10">
                      <div className="w-8 h-8 rounded-full bg-black text-white grid place-items-center font-black text-[13px]">
                        2
                      </div>
                      <div className="font-extrabold text-[14px] mt-2">Pool Shrinks Live</div>
                      <div className="text-[12px] text-black/60 mt-1">
                        Incompatible answers vanish immediately from your view.
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-black/10">
                      <div className="w-8 h-8 rounded-full bg-black text-white grid place-items-center font-black text-[13px]">
                        3
                      </div>
                      <div className="font-extrabold text-[14px] mt-2">Guess at ≤ 5 Left</div>
                      <div className="text-[12px] text-black/60 mt-1">
                        The Guess panel unlocks when 5 or fewer answers remain.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── IN-GAME BOARD (Single-Player & Multiplayer) ── */
          <div className={`pt-4 sm:pt-6 ${shake ? 'shake' : ''} relative`}>
            {/* Render Multiplayer Dual Radar HUD if playing in multiplayer */}
            {gameState === 'multiplayer_playing' && multiplayerRoom && (
              <MultiplayerHUD
                room={multiplayerRoom}
                myPlayerId={myPlayerId}
                onRematch={handleRematch}
                onLeave={goHome}
              />
            )}

            {/* Game Top Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={goHome}
                className="w-9 h-9 rounded-full bg-white border border-black/15 grid place-items-center hover:bg-black hover:text-white transition-colors cursor-pointer"
                title="Exit to Menu"
              >
                ←
              </button>

              <div className="flex items-center gap-2 bg-black text-white rounded-full px-3.5 py-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FFE03C] animate-pulse" />
                <span className="text-[12px] font-black tracking-wide">
                  {gameState === 'multiplayer_playing'
                    ? '1v1 MATCH'
                    : practiceMode
                    ? 'PRACTICE'
                    : 'DAILY'}{' '}
                  • {category.label}
                </span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white border border-black/15 rounded-full px-3 py-1.5 text-[12px] font-black">
                  <span className="w-5 h-5 rounded-full bg-[#FFE03C] border border-black/20 grid place-items-center text-[10px]">
                    ◐
                  </span>{' '}
                  {taps} TAPS
                </div>
              </div>
            </div>

            {/* Main Candidates Container */}
            <div className="mt-4 bg-white rounded-[24px] border-2 border-black overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              {/* Progress Bar */}
              <div className="h-2 w-full bg-black/5 relative overflow-hidden">
                <div
                  className="h-full bg-[#0EA5A4] transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
                {lastResult !== null && (
                  <div
                    className={`absolute inset-0 ${
                      lastResult ? 'bg-emerald-400/30' : 'bg-red-400/30'
                    } animate-pulse`}
                  />
                )}
              </div>

              <div className="px-3 sm:px-6 py-4 sm:py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl grid place-items-center text-white font-black text-[14px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 bg-black">
                      {remaining}
                    </div>
                    <div>
                      <div className="font-black text-[10px] tracking-[0.14em] text-black/50 uppercase">
                        CANDIDATES REMAINING
                      </div>
                      <div className="font-display text-[17px] sm:text-[22px] leading-none tracking-tight">
                        {remaining === totalPool
                          ? `All ${totalPool} in play`
                          : remaining <= 5
                          ? '★ GUESS READY!'
                          : `${remaining} of ${totalPool} remain`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Grid */}
                <div className="mt-4 block max-h-[45dvh] lg:max-h-[52dvh] overflow-y-auto scrollbar-none rounded-xl">
                  <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 gap-1.5 sm:gap-2 relative">
                    {pool.map((a) => {
                      if (vanishedIds.has(a.id)) return null
                      const isRemaining = candidates.some((c) => c.id === a.id)
                      const isEliminated = eliminatedIds.has(a.id)
                      const isWrong = wrongGuessId === a.id

                      return (
                        <div
                          key={a.id}
                          className={`relative aspect-square rounded-2xl border-2 grid place-items-center overflow-hidden grid-fade select-none ${
                            isRemaining
                              ? 'bg-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-100'
                              : 'bg-black/[0.04] border-black/10 scale-[0.92] opacity-40 grayscale'
                          } ${isWrong ? 'shake !border-red-500 !bg-red-50' : ''}`}
                          style={{ backgroundColor: isRemaining ? a.color : undefined }}
                        >
                          <div className="leading-none pb-5 flex items-center justify-center">
                            <Glyph a={a} size={42} rounded="rounded-xl" />
                          </div>
                          <div
                            className={`absolute bottom-0 inset-x-0 text-[8px] sm:text-[9px] font-black tracking-widest text-center py-1 truncate px-0.5 ${
                              isRemaining ? 'bg-black text-white' : 'bg-black/10 text-black/50'
                            }`}
                          >
                            {a.label.toUpperCase()}
                          </div>
                          {!isRemaining && (
                            <div className="absolute inset-0 grid place-items-center">
                              <div className="w-full h-[2px] bg-black/20 rotate-45 absolute" />
                              <div className="w-5 h-5 rounded-full bg-black text-white grid place-items-center text-[9px] font-black">
                                ✕
                              </div>
                            </div>
                          )}
                          {isEliminated && isRemaining === false && (
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[0.5px]" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Asked Chips List */}
                {asked.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {asked.map((a, i) => (
                      <div
                        key={i}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold border-2 ${
                          a.result
                            ? 'bg-emerald-500 text-white border-black'
                            : 'bg-white text-black border-black/20 line-through decoration-2'
                        }`}
                      >
                        <span>{a.result ? '✓' : '✕'}</span>
                        {a.text}
                        <span
                          className={`text-[9px] font-black rounded-full px-1.5 py-0.5 ${
                            a.result ? 'bg-white text-emerald-700' : 'bg-black text-white'
                          }`}
                        >
                          {a.result ? 'YES' : 'NO'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions: Question Chips & Guess Panel */}
            <div
              id="guess-section"
              className="mt-5 grid lg:grid-cols-[1.1fr_0.9fr] gap-5 items-start"
            >
              {/* Question Chips Panel */}
              <div className="bg-[#FFE03C] rounded-[24px] border-2 border-black p-4 sm:p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between">
                  <div className="font-display text-[16px] sm:text-[18px] leading-none tracking-tight">
                    ASK A QUESTION
                  </div>
                  <div className="text-[9px] sm:text-[11px] font-black tracking-widest bg-black text-white rounded-full px-2.5 py-1">
                    {rankedChips.length} CHIPS
                  </div>
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
                      className={`text-left bg-white rounded-xl sm:rounded-2xl border-2 border-black p-2 sm:p-3 flex items-center gap-2 min-h-[50px] hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0px] transition-all cursor-pointer disabled:opacity-50 ${
                        chipPending === chip.id ? 'animate-pulse' : ''
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-black text-white grid place-items-center text-[10px] font-black shrink-0">
                        {chipPending === chip.id ? '…' : idx + 1}
                      </span>
                      <span className="font-extrabold text-[12px] sm:text-[13px] leading-tight flex-1">
                        {chip.text}
                      </span>
                    </button>
                  ))}
                </div>

                {gameState !== 'multiplayer_playing' && (
                  <div className="mt-4 flex justify-end text-[11px] font-bold">
                    <button
                      onClick={giveUp}
                      className="underline decoration-2 text-black/60 hover:text-black cursor-pointer"
                    >
                      Give up & reveal →
                    </button>
                  </div>
                )}
              </div>

              {/* Make a Guess Panel */}
              <div
                className={`rounded-[24px] border-2 p-4 sm:p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  remaining <= 5
                    ? 'bg-[#0EA5A4] border-black text-white'
                    : 'bg-white border-black/15 text-black'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl grid place-items-center font-black border-2 border-black ${
                      remaining <= 5 ? 'bg-white text-black' : 'bg-black/10 text-black/30'
                    }`}
                  >
                    {remaining <= 5 ? '★' : '?'}
                  </div>
                  <div>
                    <div
                      className={`font-display text-[18px] leading-none ${
                        remaining <= 5 ? 'text-white' : 'text-black'
                      }`}
                    >
                      {remaining <= 5 ? 'MAKE A GUESS' : 'KEEP NARROWING'}
                    </div>
                    <div
                      className={`text-[11px] font-black tracking-widest ${
                        remaining <= 5 ? 'text-white/70' : 'text-black/40'
                      }`}
                    >
                      {remaining <= 5
                        ? `${remaining} CANDIDATES • CHOOSE ONE`
                        : `UNLOCKS AT ≤5 • NOW ${remaining}`}
                    </div>
                  </div>
                  {remaining <= 5 && (
                    <span className="ml-auto bg-[#FFE03C] text-black text-[11px] font-black rounded-full px-2.5 py-1 border border-black animate-pulse">
                      READY
                    </span>
                  )}
                </div>

                {remaining <= 5 ? (
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    {candidates.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleGuess(c)}
                        className={`bg-white text-black rounded-2xl border-2 border-black p-3 flex flex-col items-center gap-1 hover:scale-[1.02] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-[0.98] transition-all cursor-pointer ${
                          wrongGuessId === c.id ? 'bg-red-50 border-red-500' : ''
                        }`}
                      >
                        <span className="leading-none h-[30px] grid place-items-center">
                          <Glyph a={c} size={26} />
                        </span>
                        <span className="font-extrabold text-[13px] text-center leading-tight">
                          {c.label}
                        </span>
                        <span className="text-[10px] font-bold tracking-widest bg-black text-white rounded-full px-2 py-0.5">
                          GUESS →
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="bg-black/5 border border-black/10 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[13px] font-bold text-black/60">
                          Narrow the pool to guess.
                        </div>
                        <div className="text-[11px] font-mono text-black/40">
                          {remaining} → 5 to unlock
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full border border-black/20 ${
                              i < Math.max(0, 5 - remaining) ? 'bg-black' : 'bg-white'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Single Player Victory / Loss Modal */}
            {(gameState === 'won' || gameState === 'lost') && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm grid place-items-center p-4 overflow-auto animate-[fadeIn_0.2s_ease-out]">
                <div className="w-full max-w-[520px] bg-white rounded-[28px] border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <div
                    className={`px-6 py-5 text-white text-center ${
                      gameState === 'won' ? 'bg-black' : 'bg-[#FF5A4A]'
                    }`}
                  >
                    <div className="text-[44px] mb-1">{gameState === 'won' ? '🎉' : '💀'}</div>
                    <div className="font-display text-[34px] leading-tight">
                      {gameState === 'won' ? 'YOU GOT IT!' : 'BETTER LUCK NEXT TIME!'}
                    </div>
                    <div className="text-[13px] font-bold text-white/70 mt-1">
                      {gameState === 'won'
                        ? `Solved in ${taps} taps • ${category.label}`
                        : `The secret answer was ${hidden.label}`}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex gap-4 items-center bg-[#FFFBF0] border-2 border-black rounded-2xl p-4">
                      <div
                        className="w-[72px] h-[72px] rounded-xl border-2 border-black grid place-items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 overflow-hidden"
                        style={{ backgroundColor: hidden.color }}
                      >
                        <Glyph a={hidden} size={42} rounded="rounded-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-[22px] leading-none truncate">
                          {hidden.label.toUpperCase()}
                        </div>
                        <div className="text-[12px] font-medium text-black/70 mt-1 leading-snug">
                          {hidden.fact}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#FFFBF0] border border-black/10 rounded-2xl p-3">
                        <div className="font-display text-[22px]">{taps}</div>
                        <div className="text-[10px] font-black text-black/50">TAPS USED</div>
                      </div>
                      <div className="bg-black text-white rounded-2xl p-3 border-2 border-black">
                        <div className="font-display text-[22px]">{streak.count}🔥</div>
                        <div className="text-[10px] font-black text-white/60">STREAK</div>
                      </div>
                      <div className="bg-white border border-black/10 rounded-2xl p-3">
                        <div className="font-display text-[22px]">{best ?? '-'}</div>
                        <div className="text-[10px] font-black text-black/50">BEST RECORD</div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={copyShare}
                        className={`flex-1 h-12 rounded-full font-extrabold text-[14px] border-2 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                          copied
                            ? 'bg-emerald-500 border-emerald-600 text-white'
                            : 'bg-[#FFE03C] text-black border-black hover:bg-[#FFD700]'
                        }`}
                      >
                        {copied ? '✓ COPIED RESULT!' : '📋 SHARE RESULT'}
                      </button>
                      <button
                        onClick={goHome}
                        className="h-12 px-6 rounded-full bg-white border-2 border-black font-extrabold text-[13px] hover:bg-black hover:text-white transition-colors cursor-pointer"
                      >
                        BACK TO HOME
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-black/10 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold text-black/50 mb-2">
            <button onClick={() => openDoc('privacy')} className="hover:text-black cursor-pointer">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => openDoc('terms')} className="hover:text-black cursor-pointer">
              Terms of Service
            </button>
            <span>•</span>
            <button onClick={() => openDoc('cookies')} className="hover:text-black cursor-pointer">
              Cookie Policy
            </button>
            <span>•</span>
            <button onClick={() => setShowPrefs(true)} className="hover:text-black cursor-pointer">
              Manage Preferences
            </button>
          </div>
          <div className="text-[10px] font-bold text-black/30">
            © {new Date().getFullYear()} GUESS OF THE DAY • 1v1 MULTIPLAYER DEDUCTION
          </div>
        </footer>
      </main>

      {/* Cookie consent banner */}
      {showBanner && !docView && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-black text-white px-4 py-3">
          <div className="max-w-[1080px] mx-auto flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12px] font-medium">
              🍪 We use minimal storage for session streaks and anonymized analytics.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={acceptAllCookies}
                className="bg-[#FFE03C] text-black font-black rounded-full px-4 h-9 text-[12px] hover:bg-white transition-colors cursor-pointer"
              >
                ACCEPT
              </button>
              <button
                onClick={() => setShowPrefs(true)}
                className="border border-white/40 rounded-full px-4 h-9 font-bold text-[12px] hover:border-white transition-colors cursor-pointer"
              >
                PREFERENCES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
