import React, { useEffect, useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { SafeImage } from "./SafeImage"
import { HERO_POSTERS } from "./homeAssets"
import { useFilms } from "../../hooks/useFilms"
import { resolvePosterUrl } from "../../lib/poster"
import type { Film } from "../../types"

const FILMS_SEARCH = { q: "", category: "", type: "all" as const, sort: "" as const }
const ROTATE_MS = 1900
const SLOT_OFFSETS = [-3, -2, -1, 0, 1, 2, 3] as const

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

  const [index, setIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

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

  if (n === 0) {
    return (
      <div className="home-hero-arc mx-auto w-full max-w-sm py-2">
        <p className="text-center text-xs text-white/60">Chargement du catalogue…</p>
      </div>
    )
  }

  return (
    <div
      className="home-hero-arc mx-auto w-full max-w-4xl select-none py-2"
      role="region"
      aria-roledescription="carrousel"
      aria-label="Affiches en carrousel courbé"
    >
      <div className="home-hero-arc-viewport relative mx-auto h-[150px] w-full max-w-[760px] sm:h-[175px] md:h-[190px]">
        <div className="home-hero-arc-track absolute inset-0">
          {SLOT_OFFSETS.map((offset, slotIdx) => {
            const slideIdx = (index + offset + safeN * 100) % safeN
            const slide = slides[slideIdx]
            if (!slide) return null

            const posterSrc =
              slide.kind === "film" ? resolvePosterUrl(slide.film) : slide.src
            const alt = slide.kind === "film" ? slide.film.title : slide.alt
            const seed =
              slide.kind === "film"
                ? `cc-arc-${slide.film.id.slice(0, 10)}`
                : slide.seed
            const depth = Math.abs(offset)
            const x = offset * 108
            const rotateY = offset * -11
            const rotateX = depth * 1.8
            const scale = offset === 0 ? 1 : 0.92 - depth * 0.08
            const opacity = 1 - depth * 0.15
            const z = 20 - depth
            const y = depth * 4

            const inner = (
              <>
                <SafeImage
                  src={posterSrc}
                  alt={offset === 0 ? alt : ""}
                  fallbackSeed={seed}
                  className="h-full w-full object-cover"
                  loading={slotIdx < 4 ? "eager" : "lazy"}
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
                key={`${slideKey(slide, slideIdx)}-${slotIdx}-${index}`}
                className={[
                  "home-hero-arc-face absolute left-1/2 top-1/2 overflow-hidden rounded-2xl border border-white/25 bg-[#0c1222] shadow-[0_18px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/10",
                  reducedMotion ? "" : "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                ].join(" ")}
                style={{
                  width: "116px",
                  height: "174px",
                  marginLeft: "-58px",
                  marginTop: "-87px",
                  opacity,
                  zIndex: z,
                  transform: `translate3d(${x}px, ${y}px, 0) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
                }}
                aria-hidden={depth > 2}
              >
                {slide.kind === "film" ? (
                  <Link
                    to="/film/$id"
                    params={{ id: slide.film.id }}
                    className="absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
                    aria-label={`Ouvrir ${slide.film.title}`}
                    tabIndex={depth > 2 ? -1 : 0}
                  >
                    {inner}
                  </Link>
                ) : (
                  <Link
                    to="/films"
                    search={FILMS_SEARCH}
                    className="absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
                    aria-label={`Voir le catalogue — ${slide.alt}`}
                    tabIndex={depth > 2 ? -1 : 0}
                  >
                    {inner}
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-1/3 bg-gradient-to-t from-[#050B1C]/96 via-[#050B1C]/65 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-1/4 bg-gradient-to-b from-[#050B1C]/80 to-transparent"
          aria-hidden
        />
      </div>

      <p className="sr-only">
        Les affiches tournent en carrousel courbé de gauche à droite.
      </p>
    </div>
  )
}
