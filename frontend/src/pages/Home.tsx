import React, { useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { useFilms } from "../hooks/useFilms"
import { FilmCard } from "../components/films/FilmCard"
import type { Film } from "../types"

const CATEGORIES = [
  { label: "Tout", value: "" },
  { label: "Action", value: "Action" },
  { label: "Comédie", value: "Comédie" },
  { label: "Horreur", value: "Horreur" },
  { label: "Drame", value: "Drame" },
]

function isSeries(f: Film) {
  const c = (f.categories ?? []).map((x) => x.toLowerCase())
  return c.some((cat) => cat.includes("série") || cat.includes("series") || cat.includes("tv"))
}

export function Home() {
  const { data: allRaw = [] } = useFilms("", "", "")
  const all = allRaw as Film[]

  const [selectedCategory, setSelectedCategory] = React.useState("")

  const filtered = useMemo(() => {
    if (!selectedCategory) return all
    return all.filter((f) => (f.categories ?? []).includes(selectedCategory))
  }, [all, selectedCategory])

  const featured = useMemo(() => {
    if (all.length === 0) return null
    return all.find((f) => f.title?.toLowerCase().includes("monster")) ?? all[0]
  }, [all])

  const trending = useMemo(() => filtered.slice(0, 12), [filtered])

  const topSeries = useMemo(() => all.filter(isSeries).slice(0, 12), [all])
  const topFilms = useMemo(() => all.filter((f) => !isSeries(f)).slice(0, 12), [all])

  return (
    <main className="min-h-screen bg-[#050B1C] text-white pb-20">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/hero_background.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050B1C]/20 via-[#050B1C]/65 to-[#050B1C]" />

        <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-16">
          <div className="max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#3EA6FF] backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3EA6FF] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3EA6FF]" />
              </span>
              À découvrir maintenant
            </span>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none drop-shadow-[0_0_30px_rgba(29,108,224,0.25)]">
              {featured ? featured.title : "CinéConnect"}
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/70 leading-relaxed">
              Films, séries, tendances et avis — retrouve tout au même endroit et partage avec ta communauté.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {featured && (
                <Link
                  to="/film/$id"
                  params={{ id: featured.id }}
                  className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-8 py-3 font-bold text-white shadow-[0_0_18px_rgba(29,108,224,0.35)] transition-transform hover:scale-[1.03]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Voir la fiche
                </Link>
              )}

              <Link
                to="/films"
                search={{ q: "", category: selectedCategory, type: "all", sort: "" as any }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3 font-semibold text-white/90 backdrop-blur hover:bg-white/10 transition-colors"
              >
                Explorer le catalogue
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>

            {/* Catégories (pills) */}
            <div className="mt-10 flex flex-wrap gap-3">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.value
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={[
                      "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                      "border border-white/10 backdrop-blur",
                      active
                        ? "bg-[#3EA6FF]/15 text-[#3EA6FF] shadow-[0_0_12px_rgba(62,166,255,0.25)]"
                        : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10",
                    ].join(" ")}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 space-y-14 mt-8">
        <SectionHeader
          title="Tendances"
          to="/films"
          search={{ q: "", category: selectedCategory, type: "all", sort: "" as any }}
        />
        <Grid>
          {trending.map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </Grid>

        <SectionHeader title="Séries à la une" to="/films" search={{ q: "", category: "Série", type: "series", sort: "" }} />
        <Grid>
          {topSeries.map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </Grid>

        <SectionHeader title="Films à voir" to="/films" search={{ q: "", category: "", type: "movie", sort: "" }} />
        <Grid>
          {topFilms.map((film) => (
            <FilmCard key={film.id} film={film} />
          ))}
        </Grid>
      </section>
    </main>
  )
}

function SectionHeader({
  title,
  to,
  search,
}: {
  title: string
  to: "/films"
  search: any
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h2>
      <Link
        to={to}
        search={search}
        className="text-[#3EA6FF] font-bold hover:text-white transition-colors text-xs md:text-sm uppercase tracking-wider inline-flex items-center gap-1"
      >
        Voir plus
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </Link>
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {children}
    </div>
  )
}