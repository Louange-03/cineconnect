import React from "react"
import { useParams } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { omdbGetById } from "../lib/omdb"
import type { OMDBMovieDetail } from "../types"

export function FilmDetail() {
  // useParams types are finicky; cast to any to avoid verbose generics
  const { id } = useParams({} as any) as { id: string }
  const { data: film, isLoading, error } = useQuery<OMDBMovieDetail, Error>({
    queryKey: ["film", id],
    queryFn: () => (id ? omdbGetById(id) : Promise.reject(new Error("No id"))),
    enabled: !!id,
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Détail du film</h1>

      {isLoading && <p className="mt-4">Chargement...</p>}
      {error && <p className="mt-4 text-red-600">{error.message}</p>}

      {film && (
        <div className="mt-4 space-y-2">
          <p className="text-xl font-bold">{film.Title} ({film.Year})</p>
          {film.Poster && <img src={film.Poster} alt={film.Title} className="w-32" />}
          <p>{film.Plot}</p>
          <p><strong>Réalisateur :</strong> {film.Director}</p>
          <p><strong>Acteurs :</strong> {film.Actors}</p>
        </div>
      )}
    </div>
  )
}