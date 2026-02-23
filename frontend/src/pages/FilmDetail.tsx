
import React from "react"
import { useParams } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { Film } from "../types"

async function fetchFilm(id: string): Promise<Film | null> {
  const res = await fetch(`/films/${id}`)
  if (!res.ok) throw new Error("Film introuvable")
  const data = await res.json()
  return data.film || null
}

export function FilmDetail() {
  const { id } = useParams({} as any) as { id: string }
  const { data: film, isLoading, error } = useQuery<Film | null, Error>({
    queryKey: ["film", id],
    queryFn: () => fetchFilm(id),
    enabled: !!id,
  })

  if (isLoading) return <p className="mt-6">Chargement...</p>
  if (error) return <p className="mt-6 text-red-600">{error.message}</p>
  if (!film) return <p className="mt-6">Film introuvable.</p>

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-4">{film.title}</h1>
      {film.posterUrl && <img src={film.posterUrl} alt={film.title} className="w-48 rounded mb-4" />}
      <p className="mb-2"><strong>Année :</strong> {film.year}</p>
      {film.categories && film.categories.length > 0 && (
        <p className="mb-2"><strong>Catégories :</strong> {film.categories.join(", ")}</p>
      )}
      {film.synopsis && <p className="mb-2">{film.synopsis}</p>}
      {/* Ajoute ici d'autres infos (réalisateur, acteurs, etc.) si dispo */}
    </div>
  )
}