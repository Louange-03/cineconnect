export function FriendRequestCard({ user, onAccept, onReject }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border p-3">
      <div>
        <p className="font-medium">{user.username}</p>
        <p className="text-sm text-slate-600">{user.email}</p>
      </div>
      <div className="flex gap-2">
        <button className="rounded bg-black px-3 py-2 text-sm text-white" onClick={onAccept}>
          Accepter
        </button>
        <button className="rounded border px-3 py-2 text-sm hover:bg-slate-50" onClick={onReject}>
          Refuser
        </button>
      </div>
    </div>
  )
}
