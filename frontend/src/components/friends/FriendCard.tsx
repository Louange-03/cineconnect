
type Friend = {
  id: string
  username: string
  email?: string
}

type FriendCardProps = {
  user: Friend
  onRemove: (userId: string) => void
  onChat?: (userId: string) => void
}

export function FriendCard({ user, onRemove, onChat }: FriendCardProps) {
  return (
    <div className="flex items-center justify-between rounded border p-3">
      <div>
        <p className="font-medium">{user.username}</p>
        <p className="text-sm text-slate-600">{user.email ?? "—"}</p>
      </div>

      <div className="flex items-center gap-2">
        {onChat ? (
          <button
            type="button"
            className="rounded border px-3 py-2 text-sm hover:bg-imperial"
            onClick={() => onChat(user.id)}
          >
            Discuter
          </button>
        ) : null}
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