import React, { useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { useFilms } from "../hooks/useFilms"
import { FilmCard } from "../components/films/FilmCard"
import type { Film } from "../types"

export function Home() {
  const { data: allRaw = [] } = useFilms("", "", "")
  const all = allRaw as Film[]

  const categories = [
    { label: "Movies", value: "" },
    { label: "Action", value: "Action" },
    { label: "Comedies", value: "Comédie" },
    { label: "Horreur", value: "Horreur" },
  ]

  const [selectedCategory, setSelectedCategory] = React.useState("")

  const filtered = useMemo(() => {
    if (!selectedCategory) return all
    return all.filter((f) => (f.categories ?? []).includes(selectedCategory))
  }, [all, selectedCategory])

  const mostPopular = useMemo(() => filtered.slice(0, 3), [filtered])

  const featured = useMemo(() => {
    if (all.length === 0) return null
    return all.find((f) => f.title?.toLowerCase().includes("monster")) ?? all[0]
  }, [all])

  const { topSeries, topFilms } = useMemo(() => {
    const isSeries = (f: Film) => {
      const c = (f.categories ?? []).map(x => x.toLowerCase())
      return c.some(cat => cat.includes("série") || cat.includes("series") || cat.includes("tv"))
    }

    return {
      topSeries: all.filter(isSeries).slice(0, 20),
      topFilms: all.filter((f) => !isSeries(f)).slice(0, 20),
    }
  }, [all])

  return (
    <main className="min-h-screen bg-[#050B1C] text-white pb-20 overflow-hidden">
      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] w-full bg-black/50">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: "url('/hero_background.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050B1C]/30 to-[#050B1C]" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-32 pb-10 px-6 max-w-5xl mx-auto text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#3EA6FF] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3EA6FF] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3EA6FF]"></span>
            </span>
            Nouveautés Exclusives
          </span>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black drop-shadow-[0_0_30px_rgba(29,108,224,0.3)] mb-6 tracking-tighter uppercase leading-none">
            {featured ? featured.title : "CINÉ CONNECT"}
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-white/70 mb-10 font-medium leading-relaxed drop-shadow-md">
            Plongez dans un univers de divertissement premium. Des milliers de films et séries, partagés avec votre communauté.
          </p>

          {featured && (
            <Link
              to="/film/$id"
              params={{ id: featured.id }}
              className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-10 py-4 font-bold text-white shadow-[0_0_20px_rgba(29,108,224,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_35px_rgba(29,108,224,0.6)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
              Bande-annonce
            </Link>
          )}

          {/* Menu catégories */}
          <nav className="flex flex-wrap justify-center gap-6 md:gap-12 mt-20 text-lg font-semibold bg-white/5 backdrop-blur-xl px-10 py-5 rounded-full border border-white/10 shadow-2xl">
            {categories.map((cat) => (
              <button
                key={cat.label}
                type="button"
                className={`transition-all duration-300 ${selectedCategory === cat.value
                  ? "text-[#3EA6FF] scale-105 drop-shadow-[0_0_8px_rgba(62,166,255,0.6)]"
                  : "text-white/60 hover:text-white hover:scale-105"
                  }`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* TRENDING NOW */}
      <section className="mx-auto px-6 mt-[-80px] relative z-20 space-y-8">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <h2 className="text-4xl font-black text-white drop-shadow-md">Tendances Actuelles</h2>
          <Link
            to="/films"
            search={{ q: "", category: "", type: "movie", sort: "" }}
            className="text-[#3EA6FF] font-bold hover:text-white transition-colors text-sm uppercase tracking-wider flex items-center gap-1"
          >
            Tout explorer
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-4 hide-scrollbar snap-x snap-mandatory px-4 md:px-12 xl:px-[calc(50vw-40rem)]">
          {mostPopular.map((film) => (
            <div key={film.id} className="w-[280px] md:w-[320px] shrink-0 snap-center">
              <FilmCard film={film} />
            </div>
          ))}
        </div>
      </section>

      {/* TOP SERIES & FILMS */}
      <section className="mx-auto px-6 mt-16 space-y-20">
        <div className="space-y-6">
          <h3 className="max-w-7xl mx-auto text-3xl font-black text-white drop-shadow-sm">Séries à la Une</h3>
          <div className="flex gap-4 md:gap-5 overflow-x-auto pb-8 pt-2 hide-scrollbar snap-x snap-mandatory px-4 md:px-12 xl:px-[calc(50vw-40rem)]">
            {topSeries.map((film) => (
              <div key={film.id} className="w-[180px] md:w-[220px] snap-start shrink-0">
                <FilmCard film={film} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="max-w-7xl mx-auto text-3xl font-black text-white drop-shadow-sm">Grands Classiques</h3>
          <div className="flex gap-4 md:gap-5 overflow-x-auto pb-8 pt-2 hide-scrollbar snap-x snap-mandatory px-4 md:px-12 xl:px-[calc(50vw-40rem)]">
            {topFilms.map((film) => (
              <div key={film.id} className="w-[180px] md:w-[220px] snap-start shrink-0">
                <FilmCard film={film} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}