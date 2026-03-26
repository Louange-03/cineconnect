import React from "react"
import type { Film } from "../../types"
import { Link } from "@tanstack/react-router"

export function FilmList({ films }: { films: Film[] }) {
  if (!films?.length) {
    return (
      <div className="mt-10 text-center text-gray-400">
        Aucun film trouvé.
      </div>
    )
  }

  return (
    <div className="mt-10 space-y-3">
      {films.map((film) => (
        <Link
          key={film.id}
          to="/film/$id"
          params={{ id: film.id }}
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:shadow-lg"
        >
          <img
            src={
              film.posterUrl ||
              "https://via.placeholder.com/160x240/0b1020/ffffff?text=No+Image"
            }
            alt={film.title}
            className="h-20 w-14 rounded-xl border border-white/10 object-cover"
          />

          <div className="flex-1">
            <p className="text-lg font-semibold text-white">
              {film.title}
            </p>

            <div className="mt-1 flex flex-wrap gap-2 text-sm text-white/60">
              {film.year && <span>{film.year}</span>}

              {film.categories?.slice(0, 3).map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}