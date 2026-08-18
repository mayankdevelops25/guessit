import { useState } from 'react'
import { CATEGORIES, getCategoryById } from '../lib/content'
import {
  type GameMode,
  type RoomState,
  getStoredPlayerProfile,
  savePlayerProfile,
  multiplayer,
} from '../lib/multiplayer'

interface MultiplayerLobbyProps {
  onStartMultiplayerGame: (room: RoomState, myPlayerId: string) => void
  onBack: () => void
  initialRoomCode?: string
}

export default function MultiplayerLobby({
  onStartMultiplayerGame,
  onBack,
  initialRoomCode = '',
}: MultiplayerLobbyProps) {
  const [profile, setProfile] = useState(() => getStoredPlayerProfile())
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(
    initialRoomCode ? 'join' : 'create'
  )
  const [selectedCategory, setSelectedCategory] = useState<string>('animals')
  const [selectedMode, setSelectedMode] = useState<GameMode>('race')
  const [inputCode, setInputCode] = useState(initialRoomCode.toUpperCase())
  const [currentRoom, setCurrentRoom] = useState<RoomState | null>(null)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSaveName = (name: string) => {
    const next = { ...profile, name }
    setProfile(next)
    savePlayerProfile(name, profile.emoji)
  }

  const handleSaveEmoji = (emoji: string) => {
    const next = { ...profile, emoji }
    setProfile(next)
    savePlayerProfile(profile.name, emoji)
  }

  const handleCreateRoom = () => {
    setErrorMsg('')
    const room = multiplayer.createRoom(selectedMode, selectedCategory, profile)
    multiplayer.initRoom(room.code, (st) => {
      setCurrentRoom(st)
      if (st.status === 'playing') {
        onStartMultiplayerGame(st, profile.id)
      }
    })
    setCurrentRoom(room)
  }

  const handleJoinRoom = () => {
    setErrorMsg('')
    const code = inputCode.trim().toUpperCase()
    if (!code) {
      setErrorMsg('Please enter a room code')
      return
    }

    multiplayer.initRoom(code, (st) => {
      setCurrentRoom(st)
      if (st.status === 'playing') {
        onStartMultiplayerGame(st, profile.id)
      }
    })

    const joined = multiplayer.joinRoom(code, profile)
    if (!joined) {
      setErrorMsg(`Room "${code}" not found. Ensure host has created the room!`)
      return
    }
    setCurrentRoom(joined)
  }

  const handleCopyLink = () => {
    if (!currentRoom) return
    const url = `${window.location.origin}${window.location.pathname}?room=${currentRoom.code}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartGame = () => {
    if (!currentRoom) return
    multiplayer.startGame()
    onStartMultiplayerGame(currentRoom, profile.id)
  }

  const isHost = currentRoom?.players[profile.id]?.isHost
  const playerCount = currentRoom ? Object.keys(currentRoom.players).length : 0

  return (
    <div className="pt-4 sm:pt-8 max-w-[760px] mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-extrabold bg-white border border-black/10 rounded-full px-4 py-2 hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          ← BACK TO HOME
        </button>
        <div className="flex items-center gap-2 bg-[#FFE03C] border border-black rounded-full px-3.5 py-1 text-[11px] font-black tracking-wider">
          <span>⚔️</span> MULTIPLAYER 1v1
        </div>
      </div>

      {/* Room Lobby Screen (Waiting for opponent) */}
      {currentRoom ? (
        <div className="bg-white rounded-[24px] border-2 border-black p-5 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center">
            <span className="text-[12px] font-black tracking-widest text-black/50 uppercase">
              ROOM CODE
            </span>
            <div className="mt-1 font-display text-[44px] sm:text-[56px] tracking-widest leading-none text-black">
              {currentRoom.code}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleCopyLink}
                className="h-11 px-5 rounded-full bg-black text-white font-extrabold text-[13px] flex items-center gap-2 hover:bg-[#222] transition-colors cursor-pointer"
              >
                {copied ? '✓ LINK COPIED!' : '📋 COPY INVITE LINK'}
              </button>
              <div className="h-11 px-4 rounded-full bg-[#FFFBF0] border border-black/10 flex items-center gap-2 text-[12px] font-extrabold">
                <span>{getCategoryById(currentRoom.categoryId).glyph}</span>
                {getCategoryById(currentRoom.categoryId).label} •{' '}
                {currentRoom.mode === 'race' ? 'SPEED RACE' : 'TURN-BASED'}
              </div>
            </div>
          </div>

          {/* Players in Room */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <div className="text-[12px] font-black tracking-widest text-black/50 uppercase mb-3">
              PLAYERS IN DUEL ({playerCount}/2)
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {Object.values(currentRoom.players).map((p) => {
                const isMe = p.id === profile.id
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
                      isMe
                        ? 'bg-[#FFF9E6] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white border-black/15'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white border border-black/10 grid place-items-center text-[24px]">
                      {p.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[15px] truncate">
                          {p.name}
                        </span>
                        {isMe && (
                          <span className="text-[9px] font-black bg-black text-white px-2 py-0.5 rounded-full">
                            YOU
                          </span>
                        )}
                        {p.isHost && (
                          <span className="text-[9px] font-black bg-[#FFE03C] border border-black px-2 py-0.5 rounded-full">
                            HOST
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{' '}
                        READY
                      </div>
                    </div>
                  </div>
                )
              })}

              {playerCount < 2 && (
                <div className="p-4 rounded-2xl border-2 border-dashed border-black/20 flex items-center justify-center text-center bg-black/[0.02]">
                  <div>
                    <div className="text-[20px] mb-1 animate-bounce">⏳</div>
                    <div className="font-extrabold text-[13px] text-black/60">
                      Waiting for Opponent...
                    </div>
                    <div className="text-[11px] text-black/40 mt-0.5">
                      Share room code{' '}
                      <span className="font-mono font-bold text-black">
                        {currentRoom.code}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {isHost ? (
              <button
                onClick={handleStartGame}
                className="flex-1 h-[52px] rounded-full bg-black text-white font-extrabold text-[15px] flex items-center justify-center gap-2 hover:bg-[#1A1A1A] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-0.5 cursor-pointer"
              >
                START MATCH NOW <span>⚔️</span>
              </button>
            ) : (
              <div className="flex-1 h-[52px] rounded-full bg-[#FFF8E8] border border-black/20 font-extrabold text-[14px] flex items-center justify-center text-black/70">
                ⏳ Waiting for host to start match...
              </div>
            )}
            <button
              onClick={() => {
                multiplayer.cleanup()
                setCurrentRoom(null)
              }}
              className="h-[52px] px-6 rounded-full bg-white border-2 border-black font-extrabold text-[13px] hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              LEAVE ROOM
            </button>
          </div>
        </div>
      ) : (
        /* Create / Join Setup Card */
        <div className="bg-white rounded-[24px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b-2 border-black">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 font-display text-[16px] sm:text-[18px] tracking-tight transition-colors cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-black/5'
              }`}
            >
              👑 CREATE ROOM
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`py-4 font-display text-[16px] sm:text-[18px] tracking-tight transition-colors cursor-pointer ${
                activeTab === 'join'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-black/5'
              }`}
            >
              🚀 JOIN WITH CODE
            </button>
          </div>

          <div className="p-5 sm:p-8">
            {/* Player Profile Customization */}
            <div className="bg-[#FFFBF0] border border-black/10 rounded-2xl p-4 mb-6">
              <div className="text-[11px] font-black tracking-widest text-black/50 uppercase mb-2">
                YOUR PLAYER PROFILE
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white border border-black/15 rounded-xl p-1">
                  {['🦊', '🐯', '🐼', '🦁', '⚡', '👑'].map((em) => (
                    <button
                      key={em}
                      onClick={() => handleSaveEmoji(em)}
                      className={`w-9 h-9 rounded-lg grid place-items-center text-[18px] transition-transform cursor-pointer ${
                        profile.emoji === em
                          ? 'bg-[#FFE03C] scale-110 border border-black'
                          : 'hover:bg-black/5'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleSaveName(e.target.value)}
                  maxLength={16}
                  placeholder="Enter Nickname"
                  className="flex-1 min-w-[140px] h-11 px-3.5 rounded-xl bg-white border border-black/20 font-extrabold text-[14px] focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-800 text-[13px] font-bold p-3 rounded-xl">
                ⚠️ {errorMsg}
              </div>
            )}

            {activeTab === 'create' ? (
              <div>
                {/* Mode Select */}
                <div className="mb-6">
                  <label className="block text-[12px] font-black tracking-widest text-black/50 uppercase mb-2">
                    MATCH FORMAT
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMode('race')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selectedMode === 'race'
                          ? 'bg-[#FFE03C] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white border-black/15 hover:border-black/40'
                      }`}
                    >
                      <div className="font-extrabold text-[14px] flex items-center justify-between">
                        <span>⚡ SPEED RACE DUEL</span>
                        {selectedMode === 'race' && <span>✓</span>}
                      </div>
                      <div className="text-[11px] text-black/70 mt-1 leading-snug">
                        Both race with the same secret answer. Fewest taps and fastest solve wins!
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMode('turn_based')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selectedMode === 'turn_based'
                          ? 'bg-[#FFE03C] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white border-black/15 hover:border-black/40'
                      }`}
                    >
                      <div className="font-extrabold text-[14px] flex items-center justify-between">
                        <span>🔄 TURN-BASED 1v1</span>
                        {selectedMode === 'turn_based' && <span>✓</span>}
                      </div>
                      <div className="text-[11px] text-black/70 mt-1 leading-snug">
                        Alternate turns asking questions on a shared pool. Risk a guess on your turn!
                      </div>
                    </button>
                  </div>
                </div>

                {/* Category Select */}
                <div className="mb-6">
                  <label className="block text-[12px] font-black tracking-widest text-black/50 uppercase mb-2">
                    SELECT CATEGORY ({CATEGORIES.length} AVAILABLE)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {CATEGORIES.map((c) => {
                      const isSel = selectedCategory === c.id
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCategory(c.id)}
                          className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                            isSel
                              ? 'bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]'
                              : 'bg-[#FFFBF0] border-black/15 hover:border-black/40'
                          }`}
                        >
                          <div className="text-[22px] mb-0.5">{c.glyph}</div>
                          <div className="font-extrabold text-[11px] truncate tracking-wide">
                            {c.label}
                          </div>
                          <div className={`text-[9px] font-bold mt-0.5 ${isSel ? 'text-white/60' : 'text-black/40'}`}>
                            {c.answers.length} items
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={handleCreateRoom}
                  className="w-full h-[52px] rounded-full bg-black text-white font-extrabold text-[15px] flex items-center justify-center gap-2 hover:bg-[#1A1A1A] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] cursor-pointer"
                >
                  CREATE DUEL ROOM <span>→</span>
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-[12px] font-black tracking-widest text-black/50 uppercase mb-2 text-center">
                  ENTER 5-CHARACTER ROOM CODE
                </label>
                <div className="max-w-[280px] mx-auto mb-6">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="DUEL4"
                    className="w-full h-[58px] text-center font-display text-[28px] tracking-[0.25em] uppercase rounded-2xl bg-[#FFFBF0] border-2 border-black focus:outline-none focus:ring-4 focus:ring-[#FFE03C]"
                  />
                </div>

                <button
                  onClick={handleJoinRoom}
                  className="w-full h-[52px] rounded-full bg-[#FFE03C] border-2 border-black font-extrabold text-[15px] flex items-center justify-center gap-2 hover:bg-[#FFD700] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  JOIN MATCH <span>⚔️</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
