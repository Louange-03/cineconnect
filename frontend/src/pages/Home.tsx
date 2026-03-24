import React from "react"
import { Link } from "@tanstack/react-router"
import { BackdropLayer, SafeImage } from "../components/home/SafeImage"
import {
  CINEMA_BG_PRIMARY,
  MONSTERS_BACKDROP,
  MONSTERS_FOREGROUND,
} from "../components/home/homeAssets"
import { HeroAnimatedCarousel } from "../components/home/HeroAnimatedCarousel"
import { useFilms } from "../hooks/useFilms"
import type { Film } from "../types"

const FEATURE_PILLS = ["Tout", "Animé", "Comédie", "Action", "Horreur"] as const

const FILMS_SEARCH = { q: "", category: "", type: "movie" as const, sort: "" as const }

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

function readMediaType(f: Film): string {
  const raw = f.metadata
  if (!raw) return ""
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>
    const maybe = obj.Type ?? obj.type
    return typeof maybe === "string" ? maybe.toLowerCase() : ""
  } catch {
    return ""
  }
}

function isSeriesFilm(f: Film): boolean {
  const metaType = readMediaType(f)
  if (metaType.includes("series") || metaType.includes("serie")) return true
  return (f.categories ?? []).some((c) => {
    const n = normalizeCat(c)
    return n.includes("series") || n.includes("serie") || n.includes("tv")
  })
}

function isMovieFilm(f: Film): boolean {
  const metaType = readMediaType(f)
  if (metaType.includes("movie") || metaType.includes("film")) return true
  return (f.categories ?? []).some((c) => {
    const n = normalizeCat(c)
    return n.includes("movie") || n.includes("film") || n.includes("cinema")
  })
}

function PosterRow({
  items,
}: {
  items: { src: string; alt: string; seed: string }[]
}) {
  const max = Math.min(items.length, 6)
  const shown = items.slice(0, max)

  return (
    <div className="hide-scrollbar overflow-x-auto pb-2 pt-1">
      <div
        className="grid min-w-[860px] gap-3 md:min-w-0 md:gap-4"
        style={{ gridTemplateColumns: `repeat(${Math.max(shown.length, 1)}, minmax(0, 1fr))` }}
      >
      {shown.map((item, i) => (
        <Link
          key={`${item.seed}-${i}`}
          to="/films"
          search={FILMS_SEARCH}
          className="home-poster-card group relative w-full min-w-[132px] md:min-w-0"
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-[#0c1222] shadow-lg ring-0 transition duration-300 group-hover:-translate-y-1 group-hover:border-[#007BFF]/40 group-hover:shadow-[0_12px_40px_rgba(0,123,255,0.2)]">
            <SafeImage
              src={item.src}
              alt={item.alt}
              fallbackSeed={item.seed}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          </div>
        </Link>
      ))}
      </div>
    </div>
  )
}

export function Home() {
  const [pill, setPill] = React.useState<(typeof FEATURE_PILLS)[number]>("Tout")
  const { data: allFilms } = useFilms("", "", "")

  const rowsFromDb = React.useMemo(() => {
    const withPoster = (allFilms ?? []).filter(
      (f) => typeof f.posterUrl === "string" && f.posterUrl.trim() !== ""
    )
    const strictSeries = withPoster.filter(isSeriesFilm)
    const strictFilms = withPoster.filter(
      (f) => isMovieFilm(f) || (!isSeriesFilm(f) && !isAnimatedFilm(f))
    )

    const topSeries = strictSeries.slice(0, 6).map((f) => ({
      src: f.posterUrl!,
      alt: f.title,
      seed: `db-series-${f.id}`,
    }))
    const topFilms = strictFilms.slice(0, 6).map((f) => ({
      src: f.posterUrl!,
      alt: f.title,
      seed: `db-films-${f.id}`,
    }))

    return { topSeries, topFilms }
  }, [allFilms])
  const topSeriesItems = rowsFromDb.topSeries
  const topFilmsItems = rowsFromDb.topFilms

  return (
    <div data-page="home" className="home-page home-page-mockup bg-[#050B1C] text-white">
      {/* ——— HERO ——— */}
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <div className="absolute inset-0">
          <BackdropLayer
            src={CINEMA_BG_PRIMARY}
            fallbackSeed="cineconnect-hero-bg"
            overlayClassName="home-hero-overlay"
            kenBurns
          />
          <div className="home-hero-radial-glow absolute inset-0" aria-hidden />
        </div>

        <div className="home-hero-content relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pb-14 pt-8 text-center md:px-8 md:pb-18 md:pt-12">
          <h1 className="max-w-4xl text-[clamp(1.75rem,5vw,3.5rem)] font-black leading-[1.1] tracking-tight text-white">
            Découvrez notez,{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-[#00b4ff] bg-clip-text text-transparent">
              échangez.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
            Un catalogue infini, le chat en temps réel et le partage autour de ton art
            avec une communauté qui vit le cinéma comme toi.
          </p>

          <HeroAnimatedCarousel />

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/films"
              search={FILMS_SEARCH}
              className="home-cta-primary inline-flex items-center gap-2 rounded-full bg-[#007BFF] px-8 py-3.5 text-sm font-bold text-white shadow-[0_8px_32px_rgba(0,123,255,0.45)] transition hover:bg-[#0066dd]"
            >
              Explorer le catalogue
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-5 w-5"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <Link
              to="/films"
              search={FILMS_SEARCH}
              className="inline-flex items-center rounded-full border-2 border-white bg-transparent px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Explorer le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* ——— Monsters ——— */}
      <section className="relative min-h-[min(92vh,720px)] overflow-hidden border-y border-white/10">
        <div className="absolute inset-0">
          <BackdropLayer
            src={MONSTERS_BACKDROP}
            fallbackSeed="cineconnect-monsters-bg"
            className="object-[center_25%]"
            overlayClassName="home-monsters-overlay"
            kenBurns={false}
          />
          <div className="home-monsters-shade absolute inset-0" aria-hidden />
        </div>

        <div className="home-section-rise relative z-10 mx-auto grid min-h-[min(92vh,720px)] max-w-7xl items-end gap-8 px-4 py-12 md:grid-cols-2 md:items-center md:gap-10 md:px-10 md:py-16 lg:py-20">
          <div className="max-w-xl pb-4 text-left md:pb-0">
            <span className="inline-flex rounded-full border border-white/20 bg-[#0A132D]/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/95 backdrop-blur-sm">
              À découvrir maintenant
            </span>
            <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
              Monsters
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/85 md:text-base">
              Films, séries, tendances : explore ce qui fait vibrer la communauté et
              partage tes coups de cœur en temps réel.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/films"
                search={FILMS_SEARCH}
                className="inline-flex items-center gap-2 rounded-full bg-[#007BFF] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#0066dd]"
              >
                Explorer le catalogue
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <Link
                to="/films"
                search={FILMS_SEARCH}
                className="inline-flex rounded-full border-2 border-white px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Explorer le catalogue
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {FEATURE_PILLS.map((label) => {
                const active = pill === label
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPill(label)}
                    className={[
                      "rounded-full px-4 py-2 text-xs font-semibold transition md:text-sm",
                      active
                        ? "bg-[#007BFF] text-white shadow-[0_0_24px_rgba(0,123,255,0.45)]"
                        : "border border-white/35 bg-[#0A132D]/70 text-white/90 backdrop-blur-sm hover:border-white/70",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="relative flex min-h-[280px] items-center justify-center md:min-h-[420px] md:justify-end md:items-center">
            <div className="home-monsters-float relative w-full max-w-[min(100%,300px)] sm:max-w-[340px] md:max-w-[min(100%,380px)]">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0c1222] shadow-[0_28px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10 md:rounded-3xl">
                <div className="aspect-[2/3] w-full">
                  <SafeImage
                    src={MONSTERS_FOREGROUND}
                    alt="Inception"
                    fallbackSeed="cineconnect-monsters-fg"
                    className="h-full w-full object-cover object-top"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Rangées ——— */}
      <section className="home-rows-section border-t border-white/10 px-4 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="home-section-rise">
            <h3 className="text-lg font-bold tracking-tight text-white md:text-xl">
              Top series
            </h3>
            {topSeriesItems.length > 0 ? (
              <PosterRow items={topSeriesItems} />
            ) : (
              <p className="mt-3 text-sm text-white/60">Aucune série trouvée dans la base.</p>
            )}
          </div>
          <div className="home-section-rise">
            <h3 className="text-lg font-bold tracking-tight text-white md:text-xl">
              Top Films
            </h3>
            {topFilmsItems.length > 0 ? (
              <PosterRow items={topFilmsItems} />
            ) : (
              <p className="mt-3 text-sm text-white/60">Aucun film trouvé dans la base.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

