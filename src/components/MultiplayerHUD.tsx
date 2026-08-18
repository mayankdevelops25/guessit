import { useState, useEffect } from 'react'
import {
  type RoomState,
  type EmoteMessage,
  multiplayer,
} from '../lib/multiplayer'

interface MultiplayerHUDProps {
  room: RoomState
  myPlayerId: string
  onRematch: () => void
  onLeave: () => void
}

const EMOTE_OPTIONS = ['🔥', '😱', '👏', '💀', '⚡', '🎯']

export default function MultiplayerHUD({
  room,
  myPlayerId,
  onRematch,
  onLeave,
}: MultiplayerHUDProps) {
  const [activeEmotes, setActiveEmotes] = useState<EmoteMessage[]>([])

  const playersList = Object.values(room.players)
  const myPlayer = room.players[myPlayerId]
  const opponent = playersList.find((p) => p.id !== myPlayerId)

  useEffect(() => {
    // Listen for real-time emotes
    const handleEmote = (emote: EmoteMessage) => {
      setActiveEmotes((prev) => [...prev, emote])
      setTimeout(() => {
        setActiveEmotes((prev) => prev.filter((e) => e.id !== emote.id))
      }, 2500)
    }

    multiplayer.initRoom(
      room.code,
      () => {},
      handleEmote
    )
  }, [room.code])

  const handleSendEmote = (em: string) => {
    if (!myPlayer) return
    multiplayer.sendEmote(em, myPlayer.id, myPlayer.name)
  }

  const isMyTurn = room.mode === 'turn_based' ? room.turnPlayerId === myPlayerId : true
  const winner = room.winnerId ? room.players[room.winnerId] : null
  const isWinner = room.winnerId === myPlayerId

  return (
    <div className="relative mb-4">
      {/* Floating Reaction Emotes Animation */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {activeEmotes.map((e) => (
          <div
            key={e.id}
            className="absolute bottom-24 right-8 sm:right-16 text-[44px] animate-bounce"
            style={{
              animation: 'floatUp 2.5s ease-out forwards',
            }}
          >
            <span className="drop-shadow-lg">{e.emoji}</span>
            <span className="block text-[10px] font-black bg-black text-white px-2 py-0.5 rounded-full text-center mt-1">
              {e.senderName}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0px) scale(0.5); opacity: 0; }
          20% { transform: translateY(-40px) scale(1.2); opacity: 1; }
          80% { transform: translateY(-180px) scale(1); opacity: 1; }
          100% { transform: translateY(-240px) scale(0.8); opacity: 0; }
        }
      `}</style>

      {/* Main Dual Radar Bar */}
      <div className="bg-white rounded-[20px] border-2 border-black p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          {/* Player 1 (You) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FFE03C] border border-black grid place-items-center text-[20px] shrink-0">
              {myPlayer?.emoji || '👤'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-extrabold text-[13px] sm:text-[14px] truncate">
                  {myPlayer?.name || 'You'}
                </span>
                <span className="text-[9px] font-black bg-black text-white px-1.5 py-0.2 rounded">
                  YOU
                </span>
              </div>
              <div className="text-[11px] font-bold text-black/60">
                <span className="font-black text-black">{myPlayer?.remaining ?? '-'}</span> left •{' '}
                <span className="font-black text-black">{myPlayer?.taps ?? 0}</span> taps
              </div>
            </div>
          </div>

          {/* Center Badge / Turn Indicator */}
          <div className="text-center px-2">
            <div className="text-[9px] font-black bg-black text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
              {room.mode === 'race' ? '1v1 RACE' : 'TURN-BASED'}
            </div>
            <div className="text-[10px] font-mono font-bold text-black/50 mt-0.5">
              ROOM: {room.code}
            </div>
          </div>

          {/* Player 2 (Opponent) */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 min-w-0 text-right">
            <div className="min-w-0">
              <div className="font-extrabold text-[13px] sm:text-[14px] truncate">
                {opponent?.name || 'Waiting...'}
              </div>
              <div className="text-[11px] font-bold text-black/60">
                {opponent ? (
                  <>
                    <span className="font-black text-black">{opponent.remaining}</span> left •{' '}
                    <span className="font-black text-black">{opponent.taps}</span> taps
                  </>
                ) : (
                  <span className="text-amber-600">Waiting for join</span>
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-black text-white border border-black grid place-items-center text-[20px] shrink-0">
              {opponent?.emoji || '⏳'}
            </div>
          </div>
        </div>

        {/* Turn Indicator for Turn-based */}
        {room.mode === 'turn_based' && (
          <div
            className={`mt-2.5 py-1 px-3 rounded-lg text-center text-[11px] font-extrabold ${
              isMyTurn
                ? 'bg-emerald-100 border border-emerald-400 text-emerald-900 animate-pulse'
                : 'bg-amber-100 border border-amber-400 text-amber-900'
            }`}
          >
            {isMyTurn
              ? '👉 IT IS YOUR TURN — ASK A QUESTION OR GUESS!'
              : `⏳ OPPONENT'S TURN — WAITING FOR ${opponent?.name || 'OPPONENT'}...`}
          </div>
        )}

        {/* Quick Reaction Emote Buttons */}
        <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black tracking-wider text-black/40 hidden xs:inline">
              REACT:
            </span>
            {EMOTE_OPTIONS.map((em) => (
              <button
                key={em}
                onClick={() => handleSendEmote(em)}
                className="w-7 h-7 rounded-lg bg-[#FFFBF0] border border-black/10 hover:border-black hover:scale-125 transition-transform grid place-items-center text-[14px] cursor-pointer"
                title={`Send ${em}`}
              >
                {em}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLeave}
              className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
            >
              Quit Match
            </button>
          </div>
        </div>
      </div>

      {/* Duel Victory / Defeat Modal */}
      {room.status === 'ended' && winner && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border-4 border-black p-6 sm:p-8 max-w-[480px] w-full text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-200">
            <div className="text-[56px] mb-2">{isWinner ? '🏆' : '💀'}</div>

            <div className="font-display text-[32px] sm:text-[40px] leading-tight">
              {isWinner ? 'VICTORY!' : `${winner.name.toUpperCase()} WON!`}
            </div>

            <p className="text-[14px] font-extrabold text-black/70 mt-2">
              {isWinner
                ? `You correctly identified the secret answer in ${myPlayer?.taps} taps!`
                : `${winner.name} solved the puzzle first in ${winner.taps} taps!`}
            </p>

            {/* Stats Comparison */}
            <div className="mt-6 bg-[#FFFBF0] border-2 border-black rounded-2xl p-4 grid grid-cols-2 divide-x-2 divide-black/10 text-center">
              <div>
                <div className="text-[11px] font-black text-black/50 uppercase">YOU</div>
                <div className="font-display text-[22px] mt-1">{myPlayer?.taps} TAPS</div>
                <div className="text-[11px] font-bold text-black/60">
                  {myPlayer?.won ? 'SOLVED ✓' : `${myPlayer?.remaining} Left`}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-black text-black/50 uppercase">
                  {opponent?.name || 'OPPONENT'}
                </div>
                <div className="font-display text-[22px] mt-1">
                  {opponent?.taps ?? 0} TAPS
                </div>
                <div className="text-[11px] font-bold text-black/60">
                  {opponent?.won ? 'SOLVED ✓' : `${opponent?.remaining} Left`}
                </div>
              </div>
            </div>

            {/* Rematch & Exit Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onRematch}
                className="flex-1 h-[50px] rounded-full bg-[#FFE03C] border-2 border-black font-extrabold text-[15px] flex items-center justify-center gap-2 hover:bg-[#FFD700] transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                🔄 PLAY REMATCH
              </button>
              <button
                onClick={onLeave}
                className="h-[50px] px-6 rounded-full bg-white border-2 border-black font-extrabold text-[13px] hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                EXIT TO LOBBY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
