import React from "react"
import type { Film } from "../../types"
import { Link } from "@tanstack/react-router"

export function FilmList({ films }: { films: Film[] }) {
  return (
    <div className="mt-10 space-y-3">
      {films.map((film) => (
        <Link
          key={film.id}
          to="/films/$id"
          params={{ id: film.id }}
          className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
        >
          <img
            src={
              film.posterUrl ||
              "https://via.placeholder.com/160x240/0b1020/ffffff?text=No+Image"
            }
            alt={film.title}
            className="h-20 w-14 rounded-xl object-cover border border-white/10"
            loading="lazy"
          />

          <div className="min-w-0">
            <p className="text-lg font-semibold text-white truncate">
              {film.title}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/60">
              {film.year ? <span>{film.year}</span> : null}
              {film.categories?.length ? (
                <span className="text-white/40">•</span>
              ) : null}
              {film.categories?.slice(0, 3).map((c) => (
                <span key={c} className="rounded-full bg-white/10 px-2 py-0.5 border border-white/10">
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