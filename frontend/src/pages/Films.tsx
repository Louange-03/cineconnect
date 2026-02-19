import React, { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useFilms } from "../hooks/useFilms"
import type { OMDBMovie } from "../types"

export function Films(): JSX.Element {
  const [query, setQuery] = useState("")
  const { data: films, isLoading, error } = useFilms(query)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Films</h1>

      <form onSubmit={onSubmit} className="mt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un film..."
          className="w-full rounded border px-3 py-2"
        />
      </form>

      {isLoading && <p className="mt-4">Chargement...</p>}
      {error && <p className="mt-4 text-red-600">{error.message}</p>}

      {films && films.length > 0 && (
        <ul className="mt-4 space-y-3">
          {films.map((f: OMDBMovie) => (
            <li key={f.imdbID} className="flex items-center space-x-4">
              <Link to={`/film/${f.imdbID}`} className="flex items-center space-x-4">
                {f.Poster && (
                  <img src={f.Poster} alt={f.Title} className="w-16" />
                )}
                <div>
                  <p className="font-semibold">{f.Title}</p>
                  <p className="text-sm text-slate-600">{f.Year}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {films && films.length === 0 && query && (
        <p className="mt-4">Aucun film trouvé.</p>
      )}
    </div>
  )
}