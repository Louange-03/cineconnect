import React from "react"
import type { Film } from "../../types"
import { Link } from "@tanstack/react-router"
import axios from "axios"

interface FilmCardProps {
  film: Film
}

const FALLBACK_POSTER =
  "https://via.placeholder.com/600x900/0b1020/ffffff?text=No+Image"

function safePosterUrl(posterUrl?: string | null) {
  const p = (posterUrl ?? "").trim()
  if (!p) return FALLBACK_POSTER
  if (p.toLowerCase() === "n/a") return FALLBACK_POSTER
  return p
}

export function FilmCard({ film }: FilmCardProps) {
  const [isAdded, setIsAdded] = React.useState(false)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Veuillez vous connecter pour ajouter aux favoris.")
        return
      }

      const method = isAdded ? "delete" : "post"
      await axios({
        method,
        url: `http://localhost:3001/api/users/me/favorites/${film.id}`,
        headers: { Authorization: `Bearer ${token}` }
      })

      setIsAdded(!isAdded)
    } catch (err) {
      console.error(err)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    const url = `${window.location.origin}/film/${film.id}`
    try {
      await navigator.clipboard.writeText(url)
      alert(`Lien copié : ${url}`)
    } catch (err) {
      alert(`Impossible de copier le lien.`)
    }
  }
  const poster = safePosterUrl(film.posterUrl)
  const categories = film.categories?.slice(0, 2) ?? []

  const yearLabel =
    film.year === null || film.year === undefined || String(film.year).trim() === ""
      ? "—"
      : String(film.year)

  return (
    <Link
      to="/film/$id"
      params={{ id: film.id }}
      className="group block w-full outline-none"
      aria-label={`Ouvrir la fiche du film ${film.title}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg transition-transform duration-500 will-change-transform group-hover:-translate-y-1 group-hover:scale-[1.01] group-hover:shadow-[0_12px_30px_rgba(29,108,224,0.20)] group-focus-visible:ring-2 group-focus-visible:ring-[#1D6CE0] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#050B1C]">
        {/* Poster */}
        <img
          src={poster}
          alt={film.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          loading="lazy"
          onError={(e) => {
            ; (e.currentTarget as HTMLImageElement).src = FALLBACK_POSTER
          }}
        />

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B1C]/90 via-[#050B1C]/25 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-70" />
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_55%)]" />

        {/* Top meta (year + categories) */}
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
          <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md">
            {yearLabel}
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
        <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
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

        {/* Bottom hint & Actions */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleFavorite}
              className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${isAdded ? "bg-[#1D6CE0] text-white" : "bg-black/50 text-white/80 hover:bg-black/70 hover:text-white"}`}
              title={isAdded ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isAdded ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isAdded ? 0 : 2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
            <button
              onClick={handleShare}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-black/70 hover:text-white"
              title="Partager le film"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
          </div>

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