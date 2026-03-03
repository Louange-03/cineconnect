type Friend = {
  id: string
  username: string
  email: string
}

interface Props {
  user: Friend
  onRemove: (userId: string) => void
  onChat?: (userId: string) => void
}

export function FriendCard({ user, onRemove, onChat }: Props): JSX.Element {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <p className="font-semibold">{user.username}</p>
        <p className="text-sm text-slate-500">{user.email}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onChat?.(user.id)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Discuter
        </button>

        <button
          onClick={() => onRemove(user.id)}
          className="border px-4 py-2 rounded-lg hover:bg-slate-100"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}