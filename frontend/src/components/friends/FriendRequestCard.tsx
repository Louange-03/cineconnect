
type FriendRequest = {
  fromUserId: string
  fromUsername: string
  email: string
  sentAt: string
}

type FriendRequestCardProps = {
  user: FriendRequest
  onAccept: (userId: string) => void
  onReject: (userId: string) => void
}

export function FriendRequestCard({
  user,
  onAccept,
  onReject,
}: FriendRequestCardProps): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 rounded border p-3">
      <div>
        <p className="font-medium">{user.fromUsername}</p>
        <p className="text-sm text-slate-600">{user.email}</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="rounded border px-3 py-2 text-sm hover:bg-imperial"
          onClick={() => onAccept(user.fromUserId)}
        >
          Accepter
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2 text-sm hover:bg-red-400"
          onClick={() => onReject(user.fromUserId)}
        >
          Refuser
        </button>
      </div>
    </div>
  )
}