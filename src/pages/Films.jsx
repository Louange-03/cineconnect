import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { omdbSearch } from "../lib/omdb"

export function Films() {
  const [search, setSearch] = useState("batman")

  const { data: films = [], isLoading, isError, error } = useQuery({
    queryKey: ["films", search],
    queryFn: () => omdbSearch(search),
    enabled: !!search,
    staleTime: 60_000,
  })

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Films</h1>
      <p className="mt-1 text-slate-600">Recherche de films via l’API OMDb</p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un film (ex : Batman, Inception...)"
        className="mt-4 w-full max-w-md rounded border px-3 py-2"
      />

      {isLoading && <p className="mt-6">Chargement des films…</p>}

      {isError && (
        <p className="mt-6 text-red-600">
          Erreur : {error?.message || "Impossible de charger les films"}
        </p>
      )}

      {!isLoading && !isError && films.length === 0 && (
        <p className="mt-6">Aucun film trouvé.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {films.map((film) => (
          <Link
            key={film.imdbID}
            to="/film/$id"
            params={{ id: film.imdbID }}
            className="group rounded border p-2 hover:shadow"
          >
            {film.Poster && film.Poster !== "N/A" ? (
              <img
                src={film.Poster}
                alt={film.Title}
                className="mb-2 aspect-[2/3] w-full rounded object-cover"
              />
            ) : (
              <div className="mb-2 aspect-[2/3] w-full rounded bg-slate-200" />
            )}

            <h2 className="font-semibold group-hover:underline">{film.Title}</h2>
            <p className="text-sm text-slate-600">{film.Year}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
