import React, { useEffect, useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { SafeImage } from "./SafeImage"
import { HERO_POSTERS } from "./homeAssets"
import { useFilms } from "../../hooks/useFilms"
import { resolvePosterUrl } from "../../lib/poster"
import type { Film } from "../../types"

const FILMS_SEARCH = { q: "", category: "", type: "all" as const, sort: "" as const }

/** Largeur « logique » d’une affiche pour calculer le rayon du cylindre (px). */
const CARD_W = 150

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

/** Rayon translateZ pour répartir les affiches sur un cercle sans trop se chevaucher. */
function cylinderRadiusPx(n: number, cardWidth: number): number {
  const count = Math.max(n, 3)
  const half = cardWidth / 2
  return Math.round((half + 8) / Math.sin(Math.PI / count))
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

  const radiusPx = useMemo(() => cylinderRadiusPx(n, CARD_W), [n])
  const angleStep = 360 / Math.max(n, 1)

  if (n === 0) {
    return (
      <div className="home-hero-globe mx-auto w-full max-w-sm py-2">
        <p className="text-center text-xs text-white/60">Chargement du catalogue…</p>
      </div>
    )
  }

  return (
    <div
      className="home-hero-globe mx-auto w-full max-w-lg select-none py-3"
      role="region"
      aria-roledescription="carrousel"
      aria-label="Affiches sur un tour panoramique 3D"
    >
      <div className="home-hero-globe-viewport relative mx-auto h-[min(52vw,280px)] max-h-[320px] w-full max-w-[400px] sm:h-[300px] sm:max-h-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={[
              "home-hero-globe-spin-root",
              reducedMotion ? "" : "home-hero-globe-spin",
            ].join(" ")}
            style={
              reducedMotion
                ? { transformStyle: "preserve-3d", transform: "rotateX(11deg) rotateY(-22deg)" }
                : { transformStyle: "preserve-3d" }
            }
          >
            {slides.map((slide, i) => {
            const posterSrc =
              slide.kind === "film" ? resolvePosterUrl(slide.film) : slide.src
            const alt = slide.kind === "film" ? slide.film.title : slide.alt
            const seed =
              slide.kind === "film"
                ? `cc-globe-${slide.film.id.slice(0, 10)}`
                : slide.seed

            const transform = reducedMotion
              ? `rotateX(6deg) rotateY(${i * angleStep}deg) translateZ(${radiusPx}px) scale(0.92)`
              : `rotateX(6deg) rotateY(${i * angleStep}deg) translateZ(${radiusPx}px)`

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
                key={slideKey(slide, i)}
                className="home-hero-globe-face absolute overflow-hidden rounded-2xl border border-white/25 bg-[#0c1222] shadow-[0_18px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
                style={{
                  left: "50%",
                  top: "50%",
                  width: CARD_W,
                  height: Math.round(CARD_W * 1.5),
                  marginLeft: -CARD_W / 2,
                  marginTop: Math.round((-CARD_W * 1.5) / 2),
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

        {/* Masque pour immerger le globe dans le hero */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-1/4 bg-gradient-to-t from-[#050B1C]/90 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-1/5 bg-gradient-to-b from-[#050B1C]/80 to-transparent"
          aria-hidden
        />
      </div>

      <p className="sr-only">
        Les affiches défilent en rotation continue. Survolez pour mettre en pause.
      </p>
    </div>
  )
}
