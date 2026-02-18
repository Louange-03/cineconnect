export function ConversationList({ conversations, selectedId, onSelect }) {
  return (
    <aside className="border-b border-[color:var(--border)] bg-[color:var(--surface-solid)] md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] p-4">
        <div>
          <p className="text-sm font-semibold">Conversations</p>
          <p className="text-xs text-[color:var(--muted)]">
            {conversations.length} active(s)
          </p>
        </div>
      </div>

      <div className="max-h-[30vh] overflow-auto md:max-h-[72vh]">
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-[color:var(--muted)]">
            Aucune conversation
          </p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.userId}
              onClick={() => onSelect(c.userId)}
              className={`w-full px-4 py-3 text-left transition hover:bg-[color:var(--surface)] ${
                selectedId === c.userId
                  ? "bg-[color:var(--surface)]"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--cinema)] text-xs font-semibold text-white">
                  U{String(c.userId).slice(-2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    Utilisateur {c.userId}
                  </p>
                  <p className="truncate text-xs text-[color:var(--muted)]">
                    {c.lastMessage}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
