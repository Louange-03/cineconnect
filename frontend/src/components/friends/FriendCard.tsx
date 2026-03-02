
type Friend = {
  id: string
  username: string
  email: string
}

type FriendCardProps = {
  user: Friend
  onRemove: (userId: string) => void
}

export function FriendCard({ user, onRemove }: FriendCardProps): JSX.Element {
  return (
    <div className="flex items-center justify-between rounded border p-3">
      <div>
        <p className="font-medium">{user.username}</p>
        <p className="text-sm text-slate-600">{user.email}</p>
      </div>

      <button
        type="button"
        className="rounded border px-3 py-2 text-sm hover:bg-imperial"
        onClick={() => onRemove(user.id)}
      >
        Supprimer
      </button>
    </div>
  )
}