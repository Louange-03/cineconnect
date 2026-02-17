import type { Friend } from "../../types"

interface FriendCardProps {
  user: Friend;
  onRemove?: () => void;
}

export function FriendCard({ user, onRemove }: FriendCardProps) {
  return (
    <div className="flex items-center justify-between rounded border p-3">
      <div>
        <p className="font-medium">{user.username}</p>
        {user.email ? <p className="text-sm text-slate-600">{user.email}</p> : null}
      </div>

      {onRemove ? (
        <button
          type="button"
          className="rounded border px-3 py-2 text-sm hover:bg-slate-50"
          onClick={onRemove}
        >
          Supprimer
        </button>
      ) : null}
    </div>
  )
}
