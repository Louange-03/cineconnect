import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { omdbSearch } from "../lib/omdb"
import { useDebounce } from "../hooks/useDebounce"

function SkeletonCard() {
  return (
    <div className="surface overflow-hidden p-3">
      <div className="mb-3 aspect-[2/3] w-full rounded-xl bg-black/10" />
      <div className="h-4 w-3/4 rounded bg-black/10" />
      <div className="mt-2 h-3 w-1/2 rounded bg-black/10" />
    </div>
  )
}

function FilmCard({ film }) {
  const posterOk = film.Poster && film.Poster !== "N/A"

  return (
    <Link
      key={`${film.imdbID}-${film.Year || ""}`}
      to="/film/$id"
      params={{ id: film.imdbID }}
      className="group relative overflow-hidden rounded-[18px] border border-[color:var(--border)] bg-[color:var(--surface-solid)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        {posterOk ? (
          <img
            src={film.Poster}
            alt={film.Title}
            className="aspect-[2/3] w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="aspect-[2/3] w-full bg-black/10" />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent opacity-90" />
      </div>

      <div className="space-y-1 p-3">
        <h2 className="line-clamp-2 text-sm font-semibold text-[color:var(--text)]">
          {film.Title}
        </h2>
        <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
          <span>{film.Year}</span>
          <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-0.5">
            IMDb
          </span>
        </div>
      </div>
    </Link>
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="h-display text-2xl font-semibold">Films</h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Recherche de films via l’API OMDb
          </p>
        </div>

        <div className="w-full md:max-w-md">
          <label className="label" htmlFor="search">
            Rechercher
          </label>
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Batman, Inception..."
            className="input mt-1"
          />
        </div>
      </div>

      {isError && (
        <p className="surface border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Erreur : {error?.message || "Impossible de charger les films"}
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && uniqueFilms.length === 0 && (
        <div className="surface p-6 text-sm text-[color:var(--muted)]">
          Aucun film trouvé.
        </div>
      )}

      {!isLoading && !isError && uniqueFilms.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {uniqueFilms.map((film) => (
            <FilmCard key={film.imdbID} film={film} />
          ))}
        </div>
      )}
    </div>
  )
}
