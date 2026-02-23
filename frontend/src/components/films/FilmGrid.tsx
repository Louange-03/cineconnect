import React from "react"
import type { Film } from "../../types"
import { FilmCard } from "./FilmCard"

interface FilmGridProps {
  films: Film[]
}

export function FilmGrid({ films }: FilmGridProps) {
  if (!films || films.length === 0) {
    return <p className="mt-4 text-center text-gray-500">Aucun film trouvé.</p>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
      {films.map((film) => (
        <FilmCard key={film.id} film={film} />
      ))}
    </div>
  )
}
