
type FriendRequest = {
  fromUserId: string
  fromUsername: string
  email?: string
  sentAt?: string
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
}: FriendRequestCardProps) {
  const initial = user.fromUsername?.charAt(0).toUpperCase() || "U"
  return (
    <div className="friends-card flex items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/5 p-4 shadow-lg backdrop-blur-sm transition hover:bg-white/8">
      <div className="min-w-0 flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-400/20 text-sm font-semibold text-amber-200 ring-1 ring-white/15">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{user.fromUsername}</p>
          <p className="truncate text-sm text-white/60">{user.email ?? "—"}</p>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          className="rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-3.5 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25"
          onClick={() => onAccept(user.fromUserId)}
        >
          Accepter
        </button>
        <button
          type="button"
          className="rounded-xl border border-red-400/35 bg-red-500/12 px-3.5 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
          onClick={() => onReject(user.fromUserId)}
        >
          Refuser
        </button>
      </div>
    </div>
  )
}