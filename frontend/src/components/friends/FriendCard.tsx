import type { User } from "../../types"

interface FriendCardProps {
  user: User
  onRemove: () => void
}

export function FriendCard({ user, onRemove }: FriendCardProps) {
  return (
    <div className="flex items-center justify-between rounded border p-3">
      <div>
        <p className="font-medium">{user.username}</p>
        <p className="text-sm text-slate-600">{user.email}</p>
      </div>

      <button
        type="button"
        className="rounded border px-3 py-2 text-sm hover:bg-slate-50"
        onClick={onRemove}
      >
        Supprimer
      </button>
    </div>
  )
}
