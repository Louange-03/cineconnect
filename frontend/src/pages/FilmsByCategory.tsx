import React from "react"
import { useParams } from "@tanstack/react-router"
import { useFilms } from "../hooks/useFilms"
import { FilmGrid } from "../components/films/FilmGrid"

export function FilmsByCategory() {
  const { categorie } = useParams({} as any) as { categorie: string }
  const { data: films, isLoading, error } = useFilms("", categorie, "")

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-4">Films – {categorie}</h1>
      {isLoading && <p className="mt-6">Chargement...</p>}
      {error && <p className="mt-6 text-red-600">{error.message}</p>}
      {films && <FilmGrid films={films} />}
    </div>
  )
}
