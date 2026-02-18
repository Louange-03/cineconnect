import { useAuth } from "../hooks/useAuth"

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-solid)] p-4">
      <p className="text-xs font-semibold text-[color:var(--muted)]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

export function Profil() {
  const { user, isLoading, error } = useAuth()

  if (isLoading) {
    return (
      <div className="surface p-6 text-sm text-[color:var(--muted)]">
        Chargement...
      </div>
    )
  }

  if (error) {
    return (
      <p className="surface border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {error.message}
      </p>
    )
  }

  if (!user) {
    return (
      <div className="surface p-6 text-sm text-[color:var(--muted)]">
        Aucun utilisateur.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="surface overflow-hidden">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[color:var(--cinema)] text-xl font-semibold text-white shadow-sm">
              {user.username?.slice(0, 2)?.toUpperCase() || "CC"}
            </div>
            <div>
              <h1 className="h-display text-2xl font-semibold">{user.username}</h1>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                {user.email}
              </p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Bio : à personnaliser (à connecter plus tard à l’API profil)
              </p>
            </div>
          </div>

          <button type="button" className="btn btn-primary w-fit">
            Modifier le profil
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Reviews" value="—" />
        <Stat label="Films favoris" value="—" />
        <Stat label="Amis" value="—" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface p-6">
          <h2 className="h-display text-lg font-semibold">Films favoris</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            À brancher sur la logique “favoris” (placeholder UI).
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-xl border border-[color:var(--border)] bg-black/10"
              />
            ))}
          </div>
        </section>

        <section className="surface p-6">
          <h2 className="h-display text-lg font-semibold">Dernières reviews</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            À brancher sur la liste des reviews de l’utilisateur.
          </p>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-solid)] p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Film #{i + 1}</p>
                  <p className="text-sm font-semibold">★ —</p>
                </div>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  “Commentaire…”
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="surface p-6">
        <p className="text-xs font-semibold text-[color:var(--muted)]">ID</p>
        <p className="mt-1 text-sm">{user.id}</p>
      </div>
    </div>
  )
}
