import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "@tanstack/react-router"
import { SafeImage } from "./SafeImage"
import { HERO_POSTERS } from "./homeAssets"
import { useFilms } from "../../hooks/useFilms"
import { resolvePosterUrl } from "../../lib/poster"
import type { Film } from "../../types"

const FILMS_SEARCH = { q: "", category: "", type: "all" as const, sort: "" as const }
const SLIDE_MS = 3600
const SWIPE_PX = 56

type Slide =
  | { kind: "film"; film: Film }
  | { kind: "static"; src: string; alt: string; seed: string }

function buildSlides(allFilms: Film[] | undefined): Slide[] {
  const films = (allFilms ?? [])
    .filter((f) => {
      const u = resolvePosterUrl(f)
      return Boolean(u && u !== "N/A")
    })
    .slice(0, 14)

  if (films.length >= 3) {
    return films.map((film) => ({ kind: "film" as const, film }))
  }

  return HERO_POSTERS.map((p) => ({
    kind: "static" as const,
    src: p.src,
    alt: p.alt,
    seed: p.seed,
  }))
}

function slideKey(s: Slide, i: number): string {
  if (s.kind === "film") return `f-${s.film.id}`
  return `s-${s.seed}-${i}`
}

export function HeroShortsCarousel() {
  const { data: allFilms } = useFilms("", "", "")
  const slides = useMemo(() => buildSlides(allFilms), [allFilms])
  const n = slides.length
  const safeN = Math.max(n, 1)

  const [index, setIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const on = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % safeN)
  }, [safeN])

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + safeN * 10) % safeN)
  }, [safeN])

  useEffect(() => {
    if (reducedMotion || safeN <= 1) return
    const id = window.setInterval(goNext, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [reducedMotion, safeN, goNext])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current
    touchStartX.current = null
    if (start == null) return
    const dx = e.changedTouches[0].clientX - start
    if (dx > SWIPE_PX) goPrev()
    else if (dx < -SWIPE_PX) goNext()
  }

  if (n === 0) {
    return (
      <div className="home-hero-shorts mx-auto w-full max-w-sm py-2">
        <p className="text-center text-xs text-white/60">Chargement du catalogue…</p>
      </div>
    )
  }

  const active = slides[index]!

  return (
    <div
      className="home-hero-shorts mx-auto w-full max-w-[min(100%,320px)] select-none py-2"
      role="region"
      aria-roledescription="carrousel"
      aria-label="Affiches à la une"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative mx-auto aspect-[2/3] w-[min(88vw,300px)] sm:w-[min(72vw,320px)]">
        {slides.map((slide, i) => {
          const isActive = i === index
          const posterSrc =
            slide.kind === "film" ? resolvePosterUrl(slide.film) : slide.src
          const alt = slide.kind === "film" ? slide.film.title : slide.alt
          const seed =
            slide.kind === "film"
              ? `cc-shorts-${slide.film.id.slice(0, 10)}`
              : slide.seed

          const linkClass =
            "absolute inset-0 block overflow-hidden rounded-[1.35rem] outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"

          const inner = (
            <>
              <SafeImage
                src={posterSrc}
                alt={isActive ? alt : ""}
                fallbackSeed={seed}
                className="h-full w-full object-cover"
                loading={i <= 1 ? "eager" : "lazy"}
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pt-16 pb-4 px-4"
                aria-hidden
              >
                <p className="text-left text-sm font-semibold leading-snug text-white drop-shadow-md sm:text-base">
                  {alt}
                </p>
                {slide.kind === "film" && slide.film.year ? (
                  <p className="mt-1 text-left text-xs text-white/75">{slide.film.year}</p>
                ) : null}
              </div>
            </>
          )

          return (
            <div
              key={slideKey(slide, i)}
              className={[
                "absolute inset-0 overflow-hidden rounded-[1.35rem] border border-white/20 bg-[#0c1222] shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10 transition-opacity duration-700 ease-out motion-reduce:transition-none",
                isActive ? "z-[2] opacity-100" : "z-0 opacity-0 pointer-events-none",
              ].join(" ")}
              aria-hidden={!isActive}
            >
              {slide.kind === "film" ? (
                <Link
                  to="/film/$id"
                  params={{ id: slide.film.id }}
                  className={linkClass}
                  aria-label={`Ouvrir ${slide.film.title}`}
                  tabIndex={isActive ? 0 : -1}
                >
                  {inner}
                </Link>
              ) : (
                <Link
                  to="/films"
                  search={FILMS_SEARCH}
                  className={linkClass}
                  aria-label={`Voir le catalogue — ${slide.alt}`}
                  tabIndex={isActive ? 0 : -1}
                >
                  {inner}
                </Link>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-full border border-white/25 bg-[#0A132D]/80 p-2 text-white/90 backdrop-blur-sm transition hover:border-white/50 hover:bg-white/10 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#007BFF]/60"
          aria-label="Affiche précédente"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="flex max-w-[200px] flex-wrap justify-center gap-1.5" role="tablist">
          {slides.map((s, i) => (
            <button
              key={slideKey(s, i)}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Affiche ${i + 1} sur ${n}`}
              onClick={() => setIndex(i)}
              className={[
                "h-2 rounded-full transition-all duration-300",
                i === index
                  ? "w-6 bg-[#007BFF]"
                  : "w-2 bg-white/35 hover:bg-white/55",
              ].join(" ")}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          className="rounded-full border border-white/25 bg-[#0A132D]/80 p-2 text-white/90 backdrop-blur-sm transition hover:border-white/50 hover:bg-white/10 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#007BFF]/60"
          aria-label="Affiche suivante"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {active.kind === "film" ? active.film.title : active.alt}
      </p>
    </div>
  )
}
