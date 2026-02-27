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

  return (
    <Link
      to="/film/$id"
      params={{ id: film.id }}
      className="group block w-full outline-none"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_8px_30px_rgba(29,108,224,0.3)] group-focus-visible:ring-2 group-focus-visible:ring-[#1D6CE0]">
        <img
          src={poster}
          alt={film.title}
          className="h-full w-full object-cover transition-transform duration-500"
          loading="lazy"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B1C]/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-3 px-1">
        <h3 className="text-base font-semibold text-white/90 line-clamp-1 group-hover:text-white transition-colors">
          {film.title}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">{film.year || "Unknown"}</p>
          {/* Mock Rating */}
          <div className="flex items-center gap-1 text-[#FFC107]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold mt-px">4.5</span>
          </div>
        </div>
      </div>
    </Link>
  )
}