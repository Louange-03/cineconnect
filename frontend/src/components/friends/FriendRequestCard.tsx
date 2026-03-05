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
}: FriendRequestCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0A132D]/80 p-5 shadow-lg drop-shadow-md backdrop-blur-md transition-all hover:bg-[#0A132D]">
      <div className="flex items-center gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-black text-white shadow-inner">
          {user.fromUsername.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-lg font-bold tracking-wide text-white">{user.fromUsername}</p>
          <p className="truncate text-sm font-medium text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="flex shrink-0 gap-3">
        <button
          type="button"
          className="rounded-full bg-green-500/20 px-6 py-2.5 text-sm font-bold text-green-400 transition-all hover:bg-green-500 hover:text-white"
          onClick={() => onAccept(user.fromUserId)}
        >
          Accepter
        </button>
        <button
          type="button"
          className="rounded-full border border-red-500/30 px-6 py-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white hover:border-transparent"
          onClick={() => onReject(user.fromUserId)}
        >
          Refuser
        </button>
      </div>
    </div>
  )
}