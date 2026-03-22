import React, { useEffect, useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { SafeImage } from "./SafeImage"
import { HERO_POSTERS } from "./homeAssets"
import { useCategories } from "../../hooks/useCategories"
import { useFilms } from "../../hooks/useFilms"
import type { Film } from "../../types"

const FILMS_SEARCH = { q: "", category: "", type: "movie" as const, sort: "" as const }

function normalizeCat(v: string) {
  return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

/** Trouve le nom exact de catégorie « animation » en base (Animation, Animé, etc.) */
function pickAnimationCategory(
  categories: { name: string }[] | undefined
): string {
  if (!categories?.length) return ""
  let best = ""
  let bestScore = -1
  for (const c of categories) {
    const n = normalizeCat(c.name)
    let score = 0
    if (n === "animation" || n === "anime" || n === "animé") score += 10
    if (n.includes("animation")) score += 5
    if (n.includes("anime")) score += 4
    if (n.includes("anim")) score += 2
    if (score > bestScore) {
      bestScore = score
      best = c.name
    }
  }
  return bestScore > 0 ? best : ""
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

type CarouselSlot =
  | { kind: "film"; film: Film }
  | { kind: "static"; src: string; alt: string; seed: string }

const ROTATE_MS = 3200
const SLOT_OFFSETS = [-2, -1, 0, 1, 2] as const

export function HeroAnimatedCarousel() {
  const { data: categories } = useCategories()
  const animationCategory = useMemo(
    () => pickAnimationCategory(categories),
    [categories]
  )

  const { data: allFilms } = useFilms("", "", "")

  /** Films d’animation en base (catégorie dédiée si présente, sinon tags « animation » / animé). */
  const animatedFilms = useMemo(() => {
    const raw = allFilms ?? []
    const withPoster = raw.filter(
      (f) => typeof f.posterUrl === "string" && f.posterUrl.trim() !== ""
    )
    if (animationCategory) {
      const inCat = withPoster.filter((f) =>
        (f.categories ?? []).some((c) => c === animationCategory)
      )
      if (inCat.length > 0) return inCat
    }
    const tagged = withPoster.filter(isAnimatedFilm)
    return tagged
  }, [allFilms, animationCategory])

  const carouselItems: CarouselSlot[] = useMemo(() => {
    const out: CarouselSlot[] = animatedFilms.map((film) => ({
      kind: "film" as const,
      film,
    }))
    if (out.length >= 5) return out
    for (const p of HERO_POSTERS) {
      if (out.length >= 14) break
      out.push({ kind: "static", ...p })
    }
    return out
  }, [animatedFilms])

  const [rotateIndex, setRotateIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

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
    return SLOT_OFFSETS.map((offset) => {
      const idx = (rotateIndex + offset + safeN * 100) % safeN
      return { offset, item: carouselItems[idx]! }
    })
  }, [carouselItems, rotateIndex, safeN])

  return (
    <div className="home-carousel-3d mt-12 w-full max-w-4xl px-1">
      <div className="home-carousel-track home-carousel-track--fofil">
        {slots.map(({ offset, item }, i) => {
          const rotateY = offset * 20
          const scale = offset === 0 ? 1.1 : 0.84
          const z = 5 - Math.abs(offset)
          const key =
            item.kind === "film"
              ? `film-${item.film.id}-${rotateIndex}-${i}`
              : `static-${item.seed}-${rotateIndex}-${i}`

          const inner = (
            <div className="w-[92px] overflow-hidden rounded-xl border border-white/25 shadow-[0_24px_60px_rgba(0,0,0,0.65)] sm:w-[110px] md:w-[128px]">
              <SafeImage
                src={item.kind === "film" ? item.film.posterUrl! : item.src}
                alt={item.kind === "film" ? item.film.title : item.alt}
                fallbackSeed={
                  item.kind === "film"
                    ? `cc-hero-${item.film.id.slice(0, 8)}`
                    : item.seed
                }
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
                transform: `perspective(1100px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex: z,
              }}
            >
              {item.kind === "film" ? (
                <Link
                  to="/film/$id"
                  params={{ id: item.film.id }}
                  className="block outline-none focus-visible:ring-2 focus-visible:ring-[#007BFF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] rounded-xl"
                  aria-label={`Ouvrir ${item.film.title}`}
                >
                  {inner}
                </Link>
              ) : (
                <Link
                  to="/films"
                  search={FILMS_SEARCH}
                  className="block"
                  aria-label={`Catalogue — ${item.alt}`}
                >
                  {inner}
                </Link>
              )}
            </div>
          )
        })}
      </div>
      {carouselItems.length === 0 && (
        <p className="mt-4 text-center text-xs text-white/60">
          Chargement du catalogue…
        </p>
      )}
    </div>
  )
}
