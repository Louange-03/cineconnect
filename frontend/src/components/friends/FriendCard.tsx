import React from "react"
import type { Friend } from "../../types"

type FriendCardProps = {
  user: Friend
  onRemove: (userId: string) => void
  onChat?: (userId: string) => void
}

export function FriendCard({ user, onRemove, onChat }: FriendCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:shadow-2xl">
      <div className="flex items-center gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1D6CE0] to-[#3EA6FF] text-xl font-black text-white shadow-inner">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-lg font-bold tracking-wide text-white">{user.username}</p>
          <p className="truncate text-sm font-medium text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="flex shrink-0 gap-3">
        {onChat && (
          <button
            onClick={() => onChat(user.id)}
            aria-label={`Discuter avec ${user.username}`}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1D6CE0]/20 text-[#3EA6FF] transition-all hover:bg-[#1D6CE0] hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        <button
          type="button"
          aria-label={`Supprimer ${user.username}`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-red-500/30 text-red-500 transition-all hover:bg-red-500 hover:text-white hover:border-transparent"
          onClick={() => onRemove(user.id)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25-4.5v2.25m-6-2.25h12m-12 0a2.25 2.25 0 00-2.25 2.25M17.25 3.75a2.25 2.25 0 012.25 2.25" />
          </svg>
        </button>
      </div>
    </div>
  )
}