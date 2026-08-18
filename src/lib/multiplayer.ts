// Real-time Multiplayer Engine for Guess of the Day
// Supports Live 1v1 Race Duels, Turn-Based Shared Battles, and Pass & Play

import { CATEGORIES, getCategoryById, type Answer, type ChipDef } from './content'

export type GameMode = 'race' | 'turn_based' | 'pass_and_play'

export type Player = {
  id: string
  name: string
  emoji: string
  isHost: boolean
  ready: boolean
  taps: number
  remaining: number
  won: boolean
  guessAttempts: number
  lastAction?: string
}

export type RoomEvent = {
  id: string
  text: string
  time: number
  type: 'info' | 'chip' | 'guess' | 'win' | 'emote'
}

export type SharedChip = {
  id: string
  text: string
  result: boolean
  askedBy: string
}

export type RoomState = {
  code: string
  mode: GameMode
  categoryId: string
  answerId: string
  status: 'lobby' | 'starting' | 'playing' | 'ended'
  winnerId: string | null
  turnPlayerId?: string // for turn-based mode
  players: Record<string, Player>
  events: RoomEvent[]
  sharedAsked: SharedChip[]
  countdown: number | null
  updatedAt: number
}

export type EmoteMessage = {
  id: string
  emoji: string
  senderId: string
  senderName: string
  time: number
}

const PLAYER_EMOJIS = ['🦊', '🐯', '🐼', '🦁', '🦉', '🐬', '🦄', '🐲', '⚡', '👑', '🚀', '🔥']

export function getRandomAvatar(): string {
  return PLAYER_EMOJIS[Math.floor(Math.random() * PLAYER_EMOJIS.length)]
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Local storage key prefix
const ROOM_STORAGE_KEY = 'gotd_room_'
const PLAYER_ID_KEY = 'gotd_player_id'
const PLAYER_NAME_KEY = 'gotd_player_name'
const PLAYER_AVATAR_KEY = 'gotd_player_avatar'

export function getStoredPlayerProfile() {
  try {
    let id = localStorage.getItem(PLAYER_ID_KEY)
    if (!id) {
      id = 'p_' + Math.random().toString(36).slice(2, 9)
      localStorage.setItem(PLAYER_ID_KEY, id)
    }
    let name = localStorage.getItem(PLAYER_NAME_KEY) || 'Player ' + id.slice(-3).toUpperCase()
    let emoji = localStorage.getItem(PLAYER_AVATAR_KEY) || getRandomAvatar()
    return { id, name, emoji }
  } catch {
    return { id: 'p_' + Math.random().toString(36).slice(2, 9), name: 'Player 1', emoji: '🦊' }
  }
}

export function savePlayerProfile(name: string, emoji: string) {
  try {
    localStorage.setItem(PLAYER_NAME_KEY, name.trim() || 'Player')
    localStorage.setItem(PLAYER_AVATAR_KEY, emoji)
  } catch {}
}

export class MultiplayerEngine {
  private channel: BroadcastChannel | null = null
  private roomCode: string = ''
  private state: RoomState | null = null
  private onStateChangeCb: ((state: RoomState) => void) | null = null
  private onEmoteCb: ((emote: EmoteMessage) => void) | null = null
  private pollTimer: any = null

  constructor() {}

  public initRoom(code: string, onState: (state: RoomState) => void, onEmote?: (emote: EmoteMessage) => void) {
    this.cleanup()
    this.roomCode = code.toUpperCase()
    this.onStateChangeCb = onState
    if (onEmote) this.onEmoteCb = onEmote

    // Setup BroadcastChannel for zero-latency multi-tab sync
    try {
      this.channel = new BroadcastChannel(`gotd_channel_${this.roomCode}`)
      this.channel.onmessage = (event) => {
        const { type, payload } = event.data || {}
        if (type === 'STATE_UPDATE' && payload) {
          this.state = payload
          this.persistLocally(payload)
          this.onStateChangeCb?.(payload)
        } else if (type === 'EMOTE' && payload) {
          this.onEmoteCb?.(payload)
        }
      }
    } catch {}

    // Load initial state from storage or remote
    const local = this.loadLocally(this.roomCode)
    if (local) {
      this.state = local
      this.onStateChangeCb(local)
    }

    // Polling fallback / server sync
    this.pollTimer = setInterval(() => {
      this.syncWithServerOrStorage()
    }, 1200)
  }

  public createRoom(
    mode: GameMode,
    categoryId: string,
    hostPlayer: { id: string; name: string; emoji: string }
  ): RoomState {
    const code = generateRoomCode()
    const cat = getCategoryById(categoryId)
    const randomAnswer = cat.answers[Math.floor(Math.random() * cat.answers.length)]

    const newState: RoomState = {
      code,
      mode,
      categoryId,
      answerId: randomAnswer.id,
      status: 'lobby',
      winnerId: null,
      turnPlayerId: hostPlayer.id,
      players: {
        [hostPlayer.id]: {
          id: hostPlayer.id,
          name: hostPlayer.name,
          emoji: hostPlayer.emoji,
          isHost: true,
          ready: true,
          taps: 0,
          remaining: cat.answers.length,
          won: false,
          guessAttempts: 0,
        },
      },
      events: [
        {
          id: 'ev_' + Date.now(),
          text: `${hostPlayer.name} created the room (${cat.label})`,
          time: Date.now(),
          type: 'info',
        },
      ],
      sharedAsked: [],
      countdown: null,
      updatedAt: Date.now(),
    }

    this.state = newState
    this.roomCode = code
    this.persistLocally(newState)
    this.broadcastState(newState)
    return newState
  }

  public joinRoom(
    code: string,
    player: { id: string; name: string; emoji: string }
  ): RoomState | null {
    const st = this.loadLocally(code)
    if (!st) return null

    const cat = getCategoryById(st.categoryId)
    if (!st.players[player.id]) {
      st.players[player.id] = {
        id: player.id,
        name: player.name,
        emoji: player.emoji,
        isHost: false,
        ready: true,
        taps: 0,
        remaining: cat.answers.length,
        won: false,
        guessAttempts: 0,
      }
      st.events.push({
        id: 'ev_' + Date.now(),
        text: `${player.name} joined the duel!`,
        time: Date.now(),
        type: 'info',
      })
      st.updatedAt = Date.now()
    }

    this.state = st
    this.roomCode = code
    this.persistLocally(st)
    this.broadcastState(st)
    return st
  }

  public startGame() {
    if (!this.state) return
    this.state.status = 'playing'
    this.state.updatedAt = Date.now()
    this.state.events.push({
      id: 'ev_' + Date.now(),
      text: '⚔️ The duel has begun! First to solve wins.',
      time: Date.now(),
      type: 'info',
    })
    this.persistLocally(this.state)
    this.broadcastState(this.state)
    this.onStateChangeCb?.(this.state)
  }

  public updatePlayerProgress(
    playerId: string,
    taps: number,
    remaining: number,
    actionDesc?: string
  ) {
    if (!this.state) return
    const p = this.state.players[playerId]
    if (!p) return

    p.taps = taps
    p.remaining = remaining
    if (actionDesc) p.lastAction = actionDesc
    this.state.updatedAt = Date.now()

    this.persistLocally(this.state)
    this.broadcastState(this.state)
    this.onStateChangeCb?.(this.state)
  }

  public recordChipAsk(playerId: string, chipText: string, result: boolean) {
    if (!this.state) return
    const p = this.state.players[playerId]
    const pName = p ? p.name : 'A player'

    this.state.events.push({
      id: 'ev_' + Date.now() + Math.random(),
      text: `${pName} asked: "${chipText}" → ${result ? 'YES' : 'NO'}`,
      time: Date.now(),
      type: 'chip',
    })
    if (this.state.events.length > 20) this.state.events.shift()

    // If turn-based, switch turn
    if (this.state.mode === 'turn_based') {
      const playerIds = Object.keys(this.state.players)
      const nextId = playerIds.find((id) => id !== playerId) || playerId
      this.state.turnPlayerId = nextId
    }

    this.state.updatedAt = Date.now()
    this.persistLocally(this.state)
    this.broadcastState(this.state)
    this.onStateChangeCb?.(this.state)
  }

  public recordGuessAttempt(
    playerId: string,
    guessLabel: string,
    isCorrect: boolean
  ) {
    if (!this.state) return
    const p = this.state.players[playerId]
    if (!p) return

    p.guessAttempts = (p.guessAttempts || 0) + 1

    if (isCorrect) {
      p.won = true
      this.state.status = 'ended'
      this.state.winnerId = playerId
      this.state.events.push({
        id: 'ev_' + Date.now(),
        text: `🏆 ${p.name} GUESSED CORRECTLY: ${guessLabel.toUpperCase()}!`,
        time: Date.now(),
        type: 'win',
      })
    } else {
      this.state.events.push({
        id: 'ev_' + Date.now(),
        text: `❌ ${p.name} guessed ${guessLabel} — WRONG!`,
        time: Date.now(),
        type: 'guess',
      })
    }

    this.state.updatedAt = Date.now()
    this.persistLocally(this.state)
    this.broadcastState(this.state)
    this.onStateChangeCb?.(this.state)
  }

  public restartRematch(newCategoryId?: string): RoomState | null {
    if (!this.state) return null
    const catId = newCategoryId || this.state.categoryId
    const cat = getCategoryById(catId)
    const randomAnswer = cat.answers[Math.floor(Math.random() * cat.answers.length)]

    this.state.categoryId = catId
    this.state.answerId = randomAnswer.id
    this.state.status = 'playing'
    this.state.winnerId = null
    this.state.sharedAsked = []
    this.state.events = [
      {
        id: 'ev_' + Date.now(),
        text: `🔄 Rematch started! (${cat.label})`,
        time: Date.now(),
        type: 'info',
      },
    ]

    for (const id in this.state.players) {
      this.state.players[id].taps = 0
      this.state.players[id].remaining = cat.answers.length
      this.state.players[id].won = false
      this.state.players[id].guessAttempts = 0
      this.state.players[id].lastAction = undefined
    }

    this.state.updatedAt = Date.now()
    this.persistLocally(this.state)
    this.broadcastState(this.state)
    this.onStateChangeCb?.(this.state)
    return this.state
  }

  public sendEmote(emoji: string, senderId: string, senderName: string) {
    const emote: EmoteMessage = {
      id: 'em_' + Date.now() + Math.random(),
      emoji,
      senderId,
      senderName,
      time: Date.now(),
    }

    try {
      this.channel?.postMessage({ type: 'EMOTE', payload: emote })
    } catch {}
    this.onEmoteCb?.(emote)
  }

  public cleanup() {
    if (this.pollTimer) clearInterval(this.pollTimer)
    this.pollTimer = null
    if (this.channel) {
      try {
        this.channel.close()
      } catch {}
      this.channel = null
    }
  }

  private broadcastState(st: RoomState) {
    try {
      this.channel?.postMessage({ type: 'STATE_UPDATE', payload: st })
    } catch {}
  }

  private persistLocally(st: RoomState) {
    try {
      localStorage.setItem(ROOM_STORAGE_KEY + st.code, JSON.stringify(st))
    } catch {}
  }

  private loadLocally(code: string): RoomState | null {
    try {
      const raw = localStorage.getItem(ROOM_STORAGE_KEY + code)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  private syncWithServerOrStorage() {
    if (!this.roomCode) return
    const stored = this.loadLocally(this.roomCode)
    if (stored && (!this.state || stored.updatedAt > this.state.updatedAt)) {
      this.state = stored
      this.onStateChangeCb?.(stored)
    }
  }
}

export const multiplayer = new MultiplayerEngine()
