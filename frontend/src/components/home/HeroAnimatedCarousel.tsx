import React, { useEffect, useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { SafeImage } from "./SafeImage"
import { useFilms } from "../../hooks/useFilms"
import type { Film } from "../../types"

function normalizeCat(v: string) {
  return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function isAnimatedFilm(f: Film): boolean {
  return (f.categories ?? []).some((c) => {
    const n = normalizeCat(c)
    return (
      n.includes("animation") ||
      n.includes("anime") ||
      n.includes("anim") ||
      n.includes("famil")
    )
  })
}

function isSeriesFilm(f: Film): boolean {
  const t = readMediaType(f)
  if (t.includes("series") || t.includes("serie")) return true
  return (f.categories ?? []).some((c) => {
    const n = normalizeCat(c)
    return n.includes("series") || n.includes("serie") || n.includes("tv")
  })
}

function readMeta(f: Film): Record<string, unknown> {
  if (!f.metadata) return {}
  try {
    return JSON.parse(f.metadata) as Record<string, unknown>
  } catch {
    return {}
  }
}

function readMediaType(f: Film): string {
  const meta = readMeta(f)
  const maybe = meta.Type ?? meta.type
  return typeof maybe === "string" ? maybe.toLowerCase() : ""
}

function readImdbRating(f: Film): number {
  const meta = readMeta(f)
  const raw = meta.imdbRating
  if (typeof raw !== "string") return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

function readImdbVotes(f: Film): number {
  const meta = readMeta(f)
  const raw = meta.imdbVotes
  if (typeof raw !== "string") return 0
  const n = Number(raw.replaceAll(",", ""))
  return Number.isFinite(n) ? n : 0
}

function readYearScore(f: Film): number {
  const y = Number(f.year ?? "")
  if (!Number.isFinite(y)) return 0
  // Favorise légèrement les affiches récentes.
  return Math.max(0, y - 2000)
}

function scoreFilmForHero(f: Film): number {
  const rating = readImdbRating(f)
  const votes = readImdbVotes(f)
  const voteScore = Math.log10(Math.max(votes, 1))
  const yearScore = readYearScore(f) * 0.03
  return rating * 10 + voteScore * 3 + yearScore
}

type CarouselSlot =
  | { kind: "film"; film: Film }

const ROTATE_MS = 2100
const SLOT_OFFSETS = [-2, -1, 0, 1, 2] as const

export function HeroAnimatedCarousel() {
  const { data: allFilms } = useFilms("", "", "")

  /** Sélection "premium": films live-action (pas séries, pas animés), triés qualité/popularité. */
  const curatedFilms = useMemo(() => {
    const raw = allFilms ?? []
    const withPoster = raw.filter(
      (f) => typeof f.posterUrl === "string" && f.posterUrl.trim() !== ""
    )
    const moviesOnly = withPoster.filter((f) => {
      const t = readMediaType(f)
      return t ? t === "movie" || t === "film" : true
    })

    const cinematicMovies = moviesOnly.filter(
      (f) => !isSeriesFilm(f) && !isAnimatedFilm(f)
    )

    const topOther = [...cinematicMovies]
      .sort((a, b) => scoreFilmForHero(b) - scoreFilmForHero(a))
      .slice(0, 14)

    return topOther
  }, [allFilms])

  const carouselItems: CarouselSlot[] = useMemo(() => {
    const out: CarouselSlot[] = curatedFilms.map((film) => ({
      kind: "film" as const,
      film,
    }))
    return out
  }, [curatedFilms])

  const [rotateIndex, setRotateIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const on = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  const n = carouselItems.length
  const safeN = Math.max(n, 1)

  useEffect(() => {
    if (reducedMotion || safeN <= 1) return
    const id = window.setInterval(() => {
      setRotateIndex((i) => (i + 1) % safeN)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [reducedMotion, safeN])

  const slots = useMemo(() => {
    if (carouselItems.length === 0) return []
    return SLOT_OFFSETS.map((offset) => {
      const idx = (rotateIndex + offset + safeN * 100) % safeN
      return { offset, item: carouselItems[idx] }
    })
  }, [carouselItems, rotateIndex, safeN])

  if (carouselItems.length === 0) {
    return (
      <div className="home-carousel-3d mt-10 w-full max-w-4xl px-1">
        <p className="mt-4 text-center text-xs text-white/65">
          Chargement du catalogue…
        </p>
      </div>
    )
  }

  return (
    <div className="home-carousel-3d mt-10 w-full max-w-4xl px-1">
      <div className="home-carousel-track home-carousel-track--fofil">
        {slots.map(({ offset, item }, i) => {
          if (!item) return null
          const rotateY = offset * 20
          const baseScale = offset === 0 ? 1.1 : 0.84
          const z = 5 - Math.abs(offset)
          const key = `film-${item.film.id}-${rotateIndex}-${i}`
          const isFocused = offset === 0
          const isHovered = hoveredKey === key
          const scale = isHovered ? baseScale * 1.18 : baseScale
          const hoverLift = isHovered ? -14 : 0

          const inner = (
            <div
              className={[
                "w-[92px] overflow-hidden rounded-xl border border-white/25 shadow-[0_24px_60px_rgba(0,0,0,0.65)] sm:w-[110px] md:w-[128px]",
                isFocused ? "home-carousel-card--focus" : "",
              ].join(" ")}
            >
              <SafeImage
                src={item.film.posterUrl!}
                alt={item.film.title}
                fallbackSeed={`cc-hero-${item.film.id.slice(0, 8)}`}
                className="aspect-[2/3] w-full object-cover"
                loading={i === 2 ? "eager" : "lazy"}
              />
            </div>
          )

          return (
            <div
              key={key}
              className="home-carousel-card transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{
                transform: `perspective(1100px) translateY(${hoverLift}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex: isHovered ? 20 : z,
              }}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey((cur) => (cur === key ? null : cur))}
            >
              <Link
                to="/film/$id"
                params={{ id: item.film.id }}
                className="block outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C] rounded-xl"
                aria-label={`Ouvrir ${item.film.title}`}
              >
                {inner}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
