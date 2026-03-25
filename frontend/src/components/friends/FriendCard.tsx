
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
  const initial = user.username?.charAt(0).toUpperCase() || "U"
  return (
    <div className="friends-card flex items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/5 p-4 shadow-lg backdrop-blur-sm transition hover:bg-white/8">
      <div className="min-w-0 flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1D6CE0]/25 text-sm font-semibold text-[#8cc6ff] ring-1 ring-white/15">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{user.username}</p>
          <p className="truncate text-sm text-white/60">{user.email ?? "—"}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onChat ? (
          <button
            type="button"
            className="rounded-xl border border-[#3EA6FF]/35 bg-[#1D6CE0]/20 px-3.5 py-2 text-sm font-semibold text-[#cfe8ff] transition hover:bg-[#1D6CE0]/35"
            onClick={() => onChat(user.id)}
          >
            Discuter
          </button>
        ) : null}
        <button
          type="button"
          className="rounded-xl border border-red-400/35 bg-red-500/12 px-3.5 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
          onClick={() => onRemove(user.id)}
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}