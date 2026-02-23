import React from "react"
import type { Film } from "../../types"

interface FilmCardProps {
  film: Film
}

export function FilmCard({ film }: FilmCardProps) {
  return (
    <div className="rounded border shadow-sm p-3 flex flex-col items-center bg-white hover:shadow-md transition">
      {film.posterUrl && (
        <img src={film.posterUrl} alt={film.title} className="w-32 h-48 object-cover mb-2 rounded" />
      )}
      <div className="text-center">
        <h3 className="font-semibold text-lg">{film.title}</h3>
        {film.year && <p className="text-sm text-gray-500">{film.year}</p>}
        {film.categories && film.categories.length > 0 && (
          <div className="mt-1 flex flex-wrap justify-center gap-1">
            {film.categories.map((cat) => (
              <span key={cat} className="bg-slate-100 text-xs px-2 py-0.5 rounded-full text-slate-700">{cat}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
