import React from "react"
import type { Film } from "../../types"
import { Link } from "@tanstack/react-router"

export function FilmList({ films }: { films: Film[] }) {
  return (
    <div className="mt-10 space-y-3">
      {films.map((film) => (
        <Link
          key={film.id}
          to="/film/$id"
          params={{ id: film.id }}
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_10px_35px_rgba(0,0,0,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6CE0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
          aria-label={`Ouvrir ${film.title}`}
        >
          <img
            src={
              film.posterUrl ||
              "https://via.placeholder.com/160x240/0b1020/ffffff?text=No+Image"
            }
            alt={film.title}
            className="h-20 w-14 rounded-xl border border-white/10 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-white">
              {film.title}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/60">
              {film.year ? <span>{film.year}</span> : null}

              {film.categories?.length ? (
                <span className="text-white/35">•</span>
              ) : null}

              {film.categories?.slice(0, 3).map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[12px] text-white/70"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* little arrow */}
          <div className="text-white/40 transition-all group-hover:translate-x-0.5 group-hover:text-white/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  )
}