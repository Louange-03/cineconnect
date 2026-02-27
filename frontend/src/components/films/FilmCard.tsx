import React from "react"
import type { Film } from "../../types"
import { Link } from "@tanstack/react-router"

interface FilmCardProps {
  film: Film
}

export function FilmCard({ film }: FilmCardProps) {
  const poster =
    film.posterUrl ||
    "https://via.placeholder.com/600x900/0b1020/ffffff?text=No+Image"

  const categories = film.categories?.slice(0, 2) ?? []

  return (
    <Link
      to="/film/$id"
      params={{ id: film.id }}
      className="group block w-full outline-none"
      aria-label={`Ouvrir la fiche du film ${film.title}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg transition-transform duration-300 will-change-transform group-hover:-translate-y-1 group-hover:scale-[1.03] group-hover:shadow-[0_12px_40px_rgba(29,108,224,0.30)] group-focus-visible:ring-2 group-focus-visible:ring-[#1D6CE0] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#050B1C]">
        {/* Poster */}
        <img
          src={poster}
          alt={film.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          loading="lazy"
        />

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B1C]/90 via-[#050B1C]/25 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-70" />
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_55%)]" />

        {/* Top meta (year + categories) */}
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
          <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md">
            {film.year || "—"}
          </span>

          {categories.length > 0 && (
            <div className="flex gap-1.5">
              {categories.map((c) => (
                <span
                  key={c}
                  className="hidden sm:inline-flex rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-md"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-0.5 h-7 w-7"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-xs font-medium text-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Voir la fiche
          </span>

          {/* Mock rating */}
          <div className="flex items-center gap-1 text-[#FFC107] opacity-90">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-bold">4.5</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mt-3 px-1">
        <h3 className="line-clamp-1 text-base font-semibold text-white/90 transition-colors group-hover:text-white">
          {film.title}
        </h3>
      </div>
    </Link>
  )
}