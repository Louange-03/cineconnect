import React from "react"
import { Link } from "@tanstack/react-router"
import type { Film } from "../../types"

interface HeroFeatureProps {
  film: Film
}

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"

function safePosterUrl(posterUrl?: string | null) {
  const p = (posterUrl ?? "").trim()
  if (!p) return FALLBACK_HERO
  if (p.toLowerCase() === "n/a") return FALLBACK_HERO
  return p
}

export function HeroFeature({ film }: HeroFeatureProps) {
  const poster = safePosterUrl(film.posterUrl)
  const categories = film.categories?.slice(0, 3) ?? []

  const yearLabel =
    film.year === null || film.year === undefined || String(film.year).trim() === ""
      ? null
      : String(film.year)

  const [toast, setToast] = React.useState<string | null>(null)
  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 1600)
  }

  return (
    <section className="relative flex h-[60vh] items-end overflow-hidden md:h-[70vh] lg:h-[80vh]">
      {/* Background */}
      <div aria-hidden="true" className="absolute inset-0">
        <img
          src={poster}
          alt=""
          className="h-full w-full object-cover opacity-90 motion-safe:animate-fade-in motion-safe:scale-[1.02]"
          loading="eager"
          onError={(e) => {
            ; (e.currentTarget as HTMLImageElement).src = FALLBACK_HERO
          }}
        />

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B1C] via-[#050B1C]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B1C] via-[#050B1C]/35 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),rgba(5,11,28,0.85)_60%,rgba(5,11,28,1)_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-10 md:px-12 md:pb-20">
        {/* Meta */}
        <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-gray-200/90">
          {yearLabel && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold backdrop-blur-md">
              {yearLabel}
            </span>
          )}

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-medium uppercase tracking-wider text-gray-200/90 backdrop-blur-md"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Title (cliquable, mieux qu’un overlay global) */}
        <Link to="/film/$id" params={{ id: film.id }} className="inline-block">
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl hover:text-white/95 transition-colors">
            {film.title}
          </h1>
        </Link>

        {/* Synopsis (meilleure lisibilité) */}
        <div className="mt-6 max-w-2xl rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md">
          <p className="text-base leading-relaxed text-gray-200/85 sm:text-lg md:text-xl line-clamp-3">
            {film.synopsis || "Un chef-d'œuvre cinématographique à découvrir."}
          </p>
        </div>

        {/* Actions */}
        <div className="relative z-20 mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/film/$id"
            params={{ id: film.id }}
            className="group inline-flex items-center gap-2 rounded-full bg-[#1D6CE0] px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(29,108,224,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#3EA6FF] hover:shadow-[0_0_35px_rgba(29,108,224,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3EA6FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
            aria-label={`Voir la fiche du film ${film.title}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
              />
            </svg>
            Voir la fiche
          </Link>

          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
            aria-label="Ajouter à ma liste"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              showToast("Ajout à ma liste : à connecter ✅")
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.7}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* mini toast */}
      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-6 z-30 -translate-x-1/2">
          <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </section>
  )
}