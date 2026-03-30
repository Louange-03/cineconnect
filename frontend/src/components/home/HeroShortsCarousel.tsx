import React, { useEffect, useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { SafeImage } from "./SafeImage"
import { HERO_POSTERS } from "./homeAssets"
import { useFilms } from "../../hooks/useFilms"
import { resolvePosterUrl } from "../../lib/poster"
import type { Film } from "../../types"

const FILMS_SEARCH = { q: "", category: "", type: "all" as const, sort: "" as const }
const ROTATE_MS = 2400
const SLOT_OFFSETS = [-2, -1, 0, 1, 2] as const

type Slide =
  | { kind: "film"; film: Film }
  | { kind: "static"; src: string; alt: string; seed: string }

function buildSlides(allFilms: Film[] | undefined): Slide[] {
  const films = (allFilms ?? [])
    .filter((f) => {
      const u = resolvePosterUrl(f)
      return Boolean(u && u !== "N/A")
    })
    .slice(0, 12)

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
  const [reducedMotion, setReducedMotion] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const on = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  useEffect(() => {
    if (reducedMotion || safeN <= 1) return
    const id = window.setInterval(() => {
      setIndex((cur) => (cur + 1) % safeN)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [reducedMotion, safeN])

  const goPrev = () => setIndex((cur) => (cur - 1 + safeN) % safeN)
  const goNext = () => setIndex((cur) => (cur + 1) % safeN)

  if (n === 0) {
    return (
      <div className="home-hero-flow mx-auto w-full max-w-sm py-2">
        <p className="text-center text-xs text-white/60">Chargement du catalogue…</p>
      </div>
    )
  }

  return (
    <div
      className="home-hero-flow mx-auto w-full max-w-5xl select-none py-2"
      role="region"
      aria-roledescription="carrousel"
      aria-label="Affiches coverflow"
    >
      <div className="home-hero-flow-viewport relative mx-auto h-[200px] w-full max-w-[820px] sm:h-[230px] md:h-[250px]">
        <div className="home-hero-flow-stage absolute inset-0">
          {SLOT_OFFSETS.map((offset, slotIndex) => {
            const i = (index + offset + safeN * 100) % safeN
            const slide = slides[i]
            if (!slide) return null

            const posterSrc =
              slide.kind === "film" ? resolvePosterUrl(slide.film) : slide.src
            const alt = slide.kind === "film" ? slide.film.title : slide.alt
            const seed =
              slide.kind === "film"
                ? `cc-flow-${slide.film.id.slice(0, 10)}`
                : slide.seed
            const depth = Math.abs(offset)
            const x = offset * 120
            const y = depth * 6
            const scale = offset === 0 ? 1.08 : 0.86 - depth * 0.08
            const rotateY = offset * -17
            const opacity = 1 - depth * 0.24
            const zIndex = 30 - depth

            const inner = (
              <>
                <SafeImage
                  src={posterSrc}
                  alt={offset === 0 ? alt : ""}
                  fallbackSeed={seed}
                  className="h-full w-full object-cover"
                  loading={slotIndex <= 2 ? "eager" : "lazy"}
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pt-12 pb-3 px-3"
                  aria-hidden
                >
                  <p className="text-left text-xs font-semibold leading-snug text-white drop-shadow-md line-clamp-2">
                    {alt}
                  </p>
                </div>
              </>
            )

            return (
              <div
                key={`${slideKey(slide, i)}-${slotIndex}-${index}`}
                className="home-hero-flow-card absolute left-1/2 top-1/2 overflow-hidden rounded-2xl border border-white/25 bg-[#0c1222] ring-1 ring-white/10"
                style={{
                  width: "148px",
                  height: "212px",
                  marginLeft: "-74px",
                  marginTop: "-106px",
                  zIndex,
                  opacity,
                  transform: `translate3d(${x}px, ${y}px, 0) rotateY(${rotateY}deg) scale(${scale})`,
                }}
                aria-hidden={depth > 1}
              >
                {slide.kind === "film" ? (
                  <Link
                    to="/film/$id"
                    params={{ id: slide.film.id }}
                    className="absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
                    aria-label={`Ouvrir ${slide.film.title}`}
                    tabIndex={depth > 1 ? -1 : 0}
                  >
                    {inner}
                  </Link>
                ) : (
                  <Link
                    to="/films"
                    search={FILMS_SEARCH}
                    className="absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
                    aria-label={`Voir le catalogue — ${slide.alt}`}
                    tabIndex={depth > 1 ? -1 : 0}
                  >
                    {inner}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          className="home-hero-flow-btn rounded-md px-4 py-2 text-sm font-semibold text-white/90"
          aria-label="Précédent"
        >
          PREV
        </button>
        <button
          type="button"
          onClick={goNext}
          className="home-hero-flow-btn home-hero-flow-btn--next rounded-md px-4 py-2 text-sm font-semibold text-white"
          aria-label="Suivant"
        >
          NEXT
        </button>
      </div>

      <p className="sr-only">
        Les affiches défilent avec carte centrale mise en avant.
      </p>
    </div>
  )
}
