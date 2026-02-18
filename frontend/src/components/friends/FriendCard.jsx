export function FriendCard({ user, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-solid)] p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--cinema)] text-sm font-semibold text-white">
          {user.username?.slice(0, 2)?.toUpperCase() || "CC"}
        </div>
        <div>
          <p className="text-sm font-semibold">{user.username}</p>
          <p className="text-xs text-[color:var(--muted)]">{user.email}</p>
        </div>
      </div>

      <button type="button" className="btn btn-ghost" onClick={onRemove}>
        Supprimer
      </button>
    </div>
  )
}
