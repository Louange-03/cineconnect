import React from "react"
import type { Film } from "../../types"
import { FilmCard } from "./FilmCard"

interface FilmGridProps {
  films: Film[]
}

export function FilmGrid({ films }: FilmGridProps) {
  if (!films || films.length === 0) {
    return (
      <div className="mt-16 text-center text-white/65">
        Aucun film trouvé.
      </div>
    )
  }

  return (
    <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {films.map((film) => (
        <FilmCard key={film.id} film={film} />
      ))}
    </div>
  )
}