import { useEffect, useMemo, useState } from "react"
import { HERO_POSTERS } from "../components/home/homeAssets"
import { resolvePosterUrl } from "../lib/poster"
import type { Film } from "../types"

const CARD_W = 116

export type HeroSlide =
  | { kind: "film"; film: Film }
  | { kind: "static"; src: string; alt: string; seed: string }

function buildSlides(allFilms: Film[] | undefined): HeroSlide[] {
  const films = (allFilms ?? [])
    .filter((f) => {
      const u = resolvePosterUrl(f)
      return Boolean(u && u !== "N/A")
    })
    .slice(0, 12)

  if (films.length >= 3) return films.map((film) => ({ kind: "film" as const, film }))
  return HERO_POSTERS.map((p) => ({ kind: "static" as const, src: p.src, alt: p.alt, seed: p.seed }))
}

export function getHeroSlideKey(slide: HeroSlide, index: number): string {
  if (slide.kind === "film") return `f-${slide.film.id}`
  return `s-${slide.seed}-${index}`
}

export function useHeroShortsCarousel(allFilms: Film[] | undefined) {
  const slides = useMemo(() => buildSlides(allFilms), [allFilms])
  const n = slides.length
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const radiusPx = useMemo(() => {
    const count = Math.max(n, 3)
    return Math.round((CARD_W / 2 + 10) / Math.sin(Math.PI / count))
  }, [n])
  const angleStep = 360 / Math.max(n, 1)

  return { slides, n, reducedMotion, radiusPx, angleStep, cardWidth: CARD_W }
}
