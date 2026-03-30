import React, { useEffect, useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { SafeImage } from "./SafeImage"
import { HERO_POSTERS } from "./homeAssets"
import { useFilms } from "../../hooks/useFilms"
import { resolvePosterUrl } from "../../lib/poster"
import type { Film } from "../../types"

const FILMS_SEARCH = { q: "", category: "", type: "all" as const, sort: "" as const }
const CARD_W = 116

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
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const on = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  const radiusPx = useMemo(() => {
    const count = Math.max(n, 3)
    return Math.round((CARD_W / 2 + 10) / Math.sin(Math.PI / count))
  }, [n])
  const angleStep = 360 / Math.max(n, 1)

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
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={[
              "home-hero-arc-spin-root",
              reducedMotion ? "" : "home-hero-arc-spin",
            ].join(" ")}
            style={
              reducedMotion
                ? { transformStyle: "preserve-3d", transform: "rotateX(10deg) rotateY(-20deg)" }
                : { transformStyle: "preserve-3d" }
            }
          >
            {slides.map((slide, i) => {
            const posterSrc =
              slide.kind === "film" ? resolvePosterUrl(slide.film) : slide.src
            const alt = slide.kind === "film" ? slide.film.title : slide.alt
            const seed =
              slide.kind === "film"
                ? `cc-arc-${slide.film.id.slice(0, 10)}`
                : slide.seed
            const transform = `rotateY(${i * angleStep}deg) translateZ(${radiusPx}px)`

            const inner = (
              <>
                <SafeImage
                  src={posterSrc}
                  alt=""
                  fallbackSeed={seed}
                  className="h-full w-full object-cover"
                  loading={i <= 3 ? "eager" : "lazy"}
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
                key={`${slideKey(slide, i)}-${i}`}
                className={[
                  "home-hero-arc-face absolute left-1/2 top-1/2 overflow-hidden rounded-2xl border border-white/25 bg-[#0c1222] shadow-[0_18px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/10",
                ].join(" ")}
                style={{
                  width: `${CARD_W}px`,
                  height: `${Math.round(CARD_W * 1.5)}px`,
                  marginLeft: "-58px",
                  marginTop: "-87px",
                  transform,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                {slide.kind === "film" ? (
                  <Link
                    to="/film/$id"
                    params={{ id: slide.film.id }}
                    className="absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
                    aria-label={`Ouvrir ${slide.film.title}`}
                  >
                    {inner}
                  </Link>
                ) : (
                  <Link
                    to="/films"
                    search={FILMS_SEARCH}
                    className="absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
                    aria-label={`Voir le catalogue — ${slide.alt}`}
                  >
                    {inner}
                  </Link>
                )}
              </div>
            )
            })}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-1/3 bg-gradient-to-t from-[#050B1C]/96 via-[#050B1C]/65 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-1/4 bg-gradient-to-b from-[#050B1C]/80 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[16%] bg-gradient-to-r from-[#050B1C]/96 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[16%] bg-gradient-to-l from-[#050B1C]/96 to-transparent"
          aria-hidden
        />
      </div>

      <p className="sr-only">
        Les affiches tournent en carrousel courbé de gauche à droite.
      </p>
    </div>
  )
}
