import React from "react"
import type { Friend } from "../../types"

type FriendCardProps = {
  user: Friend
  onRemove: (userId: string) => void
  onChat?: (userId: string) => void
}

export function FriendCard({ user, onRemove, onChat }: FriendCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <p className="font-semibold">{user.username}</p>
        <p className="text-sm text-slate-500">{user.email}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onChat?.(user.id)}
          className="rounded border border-ocean bg-ocean/10 px-3 py-2 text-sm text-frost hover:bg-ocean/30"
        >
          Discuter
        </button>

        <button
          type="button"
          className="rounded border px-3 py-2 text-sm hover:bg-imperial"
          onClick={() => onRemove(user.id)}
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}