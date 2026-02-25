import React from "react"
import type { Film } from "../../types"
import { Link } from "@tanstack/react-router"

interface FilmCardProps {
  film: Film
}

export function FilmCard({ film }: FilmCardProps) {
  const poster =
    film.posterUrl ||
    "https://via.placeholder.com/900x1350/0b1020/ffffff?text=No+Image"

  return (
    <Link
      to="/films/$id"
      params={{ id: film.id }}
      className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={poster}
          alt={film.title}
          className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>

      <div className="p-4">
        <p className="font-semibold text-white line-clamp-1">{film.title}</p>
        <p className="mt-1 text-sm text-white/60">{film.year || "—"}</p>

        {film.categories?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {film.categories.slice(0, 2).map((c) => (
              <span
                key={c}
                className="text-[11px] px-3 py-1 rounded-full bg-white/10 text-white/75 border border-white/10"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  )
}