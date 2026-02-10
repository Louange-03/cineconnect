import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchUsers } from "../lib/userApi"
import { useDebounce } from "../hooks/useDebounce"

export function Utilisateurs() {
  const [search, setSearch] = useState("")
  const debounced = useDebounce(search, 300)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 30_000,
  })

  const users = data?.users || []

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    )
  }, [users, debounced])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Utilisateurs</h1>
        <p className="text-sm text-slate-600">
          Recherche d’utilisateurs (protégé)
        </p>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher par username ou email…"
        className="w-full max-w-md rounded border px-3 py-2"
      />

      {isLoading && <p className="text-slate-600">Chargement…</p>}

      {isError && (
        <p className="text-red-600">
          Erreur : {error?.message || "Impossible de charger les utilisateurs"}
        </p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <p className="text-slate-600">Aucun utilisateur trouvé.</p>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="rounded border p-3">
              <p className="font-medium">{u.username}</p>
              <p className="text-sm text-slate-600">{u.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
