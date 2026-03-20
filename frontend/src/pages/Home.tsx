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
      {/* Barre de catégories (style screenshot) */}
      <section className="mx-auto max-w-5xl px-6 pt-10 pb-4">
        <div className="flex flex-wrap gap-3 rounded-full bg-[#050B1C]/80 px-3 py-2 md:px-4 md:py-3">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.value
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={[
                  "rounded-full px-4 md:px-5 py-1.5 text-xs md:text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] text-white shadow-[0_0_18px_rgba(62,166,255,0.5)] border border-[#3EA6FF]/60"
                    : "bg-[#020617] text-white/70 border border-white/10 hover:border-white/25 hover:text-white",
                ].join(" ")}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* CONTENU – carrousels */}
      <section className="mx-auto mt-4 max-w-6xl space-y-10 px-6 pb-12">
        <SectionHeader
          title="Tendances"
          to="/films"
          search={{ q: "", category: selectedCategory, type: "all", sort: "" as any }}
        />
        <HorizontalRow>
          {trending.map((film) => (
            <div key={film.id} className="w-[180px] sm:w-[220px] md:w-[260px] shrink-0">
              <FilmCard film={film} />
            </div>
          ))}
        </HorizontalRow>

        <SectionHeader
          title="Séries à la une"
          to="/films"
          search={{ q: "", category: "Série", type: "series", sort: "" }}
        />
        <HorizontalRow>
          {topSeries.map((film) => (
            <div key={film.id} className="w-[180px] sm:w-[220px] md:w-[260px] shrink-0">
              <FilmCard film={film} />
            </div>
          ))}
        </HorizontalRow>

        <SectionHeader
          title="Films à voir"
          to="/films"
          search={{ q: "", category: "", type: "movie", sort: "" }}
        />
        <HorizontalRow>
          {topFilms.map((film) => (
            <div key={film.id} className="w-[180px] sm:w-[220px] md:w-[260px] shrink-0">
              <FilmCard film={film} />
            </div>
          ))}
        </HorizontalRow>
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

function HorizontalRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2 pt-1">
      {children}
    </div>
  )
}