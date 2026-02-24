import React from "react"
import { Link } from "@tanstack/react-router"
import type { Film } from "../../types"

interface FilmCardProps {
  film: Film
}

export function FilmCard({ film }: FilmCardProps) {
  const poster =
    film.posterUrl ||
    "https://via.placeholder.com/300x450/0b1020/ffffff?text=No+Image"

  return (
    <Link
      to={`/films/${film.id}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#0B1020] border border-white/10 hover:border-white/20 transition">

        {/* IMAGE */}
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={poster}
            alt={film.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        </div>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />

        {/* CONTENT */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-sm md:text-base leading-tight line-clamp-2">
            {film.title}
          </h3>

          {film.year && (
            <p className="text-white/70 text-xs mt-1">
              {film.year}
            </p>
          )}

          {/* CATEGORIES */}
          {film.categories && film.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {film.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}