import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { omdbSearch } from "../lib/omdb"
import { useDebounce } from "../hooks/useDebounce"

function SkeletonCard() {
  return (
    <div className="rounded border p-2">
      <div className="mb-2 aspect-[2/3] w-full rounded bg-slate-200" />
      <div className="h-4 w-3/4 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
    </div>
  )
}

export function Films() {
  const [search, setSearch] = useState("batman")
  const debounced = useDebounce(search, 450)

  const q = useMemo(() => debounced.trim(), [debounced])

  const { data: films = [], isLoading, isError, error } = useQuery({
    queryKey: ["films", q],
    queryFn: () => omdbSearch(q),
    enabled: q.length > 0,
    staleTime: 60_000,
  })

  // ✅ Déduplication par imdbID pour éviter "duplicate key"
  const uniqueFilms = useMemo(() => {
    const map = new Map()
    for (const f of films) {
      if (!f?.imdbID) continue
      if (!map.has(f.imdbID)) map.set(f.imdbID, f)
    }
    return Array.from(map.values())
  }, [films])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Films</h1>
        <p className="mt-1 text-sm text-slate-600">
          Recherche de films via l'API OMDb
        </p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un film (ex : Batman, Inception...)"
        className="w-full max-w-md rounded border px-3 py-2"
      />

      {isError && (
        <p className="text-red-600">
          Erreur : {error?.message || "Impossible de charger les films"}
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && uniqueFilms.length === 0 && (
        <p className="text-slate-600">Aucun film trouvé.</p>
      )}

      {!isLoading && !isError && uniqueFilms.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {uniqueFilms.map((film) => (
            <Link
              key={`${film.imdbID}-${film.Year || ""}`}
              to="/film/$id"
              params={{ id: film.imdbID }}
              className="group rounded border p-2 hover:shadow"
            >
              {film.Poster && film.Poster !== "N/A" ? (
                <img
                  src={film.Poster}
                  alt={film.Title}
                  className="mb-2 aspect-[2/3] w-full rounded object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="mb-2 aspect-[2/3] w-full rounded bg-slate-200" />
              )}

              <h2 className="font-semibold group-hover:underline">
                {film.Title}
              </h2>
              <p className="text-sm text-slate-600">{film.Year}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
