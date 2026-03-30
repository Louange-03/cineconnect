
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
    <div className="friends-card flex flex-col items-start gap-3 rounded-2xl border border-white/12 bg-white/5 p-3 shadow-lg backdrop-blur-sm transition hover:bg-white/8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
      <div className="min-w-0 flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1D6CE0]/25 text-sm font-semibold text-[#8cc6ff] ring-1 ring-white/15">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{user.username}</p>
          <p className="truncate text-sm text-white/60">{user.email ?? "—"}</p>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
        {onChat ? (
          <button
            type="button"
            className="rounded-xl border border-[#3EA6FF]/35 bg-[#1D6CE0]/20 px-3 py-2 text-xs font-semibold text-[#cfe8ff] transition hover:bg-[#1D6CE0]/35 sm:px-3.5 sm:text-sm"
            onClick={() => onChat(user.id)}
          >
            Discuter
          </button>
        ) : null}
        <button
          type="button"
          className="rounded-xl border border-red-400/35 bg-red-500/12 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 sm:px-3.5 sm:text-sm"
          onClick={() => onRemove(user.id)}
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}