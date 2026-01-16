import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { omdbSearch } from "../lib/omdb"

export function Films() {
  const [search, setSearch] = useState("batman")

  const { data: films, isLoading, error } = useQuery({
    queryKey: ["films", search],
    queryFn: () => omdbSearch(search),
    enabled: !!search,
  })

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Films</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un film..."
        className="border px-3 py-2 mb-6 w-full max-w-md"
      />

      {isLoading && <p>Chargement...</p>}
      {error && <p>Erreur lors du chargement</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {films?.map((film) => (
          <div key={film.imdbID} className="border p-2">
            {film.Poster !== "N/A" ? (
              <img src={film.Poster} alt={film.Title} className="mb-2" />
            ) : (
              <div className="mb-2 h-40 bg-slate-100" />
            )}
            <h2 className="font-semibold">{film.Title}</h2>
            <p className="text-sm">{film.Year}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
