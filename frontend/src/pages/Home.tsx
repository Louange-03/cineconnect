import React, { useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { useFilms } from "../hooks/useFilms"

type Film = {
  id: string
  title: string
  posterUrl?: string | null
  categories?: string[] | null
}

const FALLBACK_POSTER = "/poster-placeholder.png" // mets une image dans /public si tu veux

function MoviePoster({ film, className = "" }: { film: Film; className?: string }) {
  const src = film.posterUrl && film.posterUrl.trim() !== "" ? film.posterUrl : FALLBACK_POSTER

  return (
    <img
      src={src}
      alt={film.title}
      loading="lazy"
      className={className}
      onError={(e) => {
        ;(e.currentTarget as HTMLImageElement).src = FALLBACK_POSTER
      }}
    />
  )
}

function MovieCard({ film }: { film: Film }) {
  return (
    <Link
      to="/film/$id"
      params={{ id: film.id }}
      className="group block shrink-0"
    >
      <MoviePoster
        film={film}
        className="w-32 h-48 object-cover rounded-xl shadow-lg border-2 border-white/10 bg-white/10 group-hover:scale-[1.02] transition"
      />
      <p className="mt-2 text-sm text-white/80 max-w-[8rem] truncate group-hover:text-white transition">
        {film.title}
      </p>
    </Link>
  )
}

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
      const c = f.categories ?? []
      return c.includes("Série") || c.includes("Series") || c.includes("TV")
    }

    return {
      topSeries: all.filter(isSeries).slice(0, 6),
      topFilms: all.filter((f) => !isSeries(f)).slice(0, 6),
    }
  }, [all])

  return (
    <main className="min-h-screen bg-[#050B1C] text-white">
      {/* HERO */}
      {featured && (
        <section className="relative flex flex-col items-center justify-center min-h-[70vh] w-full overflow-hidden">
          <MoviePoster
            film={featured}
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div className="relative z-10 flex flex-col items-center justify-center h-full pt-24 pb-10 px-6">
            <MoviePoster
              film={featured}
              className="w-64 h-80 object-cover rounded-2xl shadow-xl border-4 border-white/10 mb-6"
            />

            <h1 className="text-5xl md:text-6xl font-black drop-shadow-lg mb-2 text-center">
              {featured.title}
            </h1>

            <Link
              to="/film/$id"
              params={{ id: featured.id }}
              className="mt-6 mb-8 px-10 py-3 rounded-full bg-[#1D6CE0] text-white font-bold text-lg shadow-lg hover:bg-[#174ea6] transition"
            >
              View details
            </Link>

            {/* Menu catégories */}
            <nav className="flex flex-wrap justify-center gap-6 mt-2 mb-2 text-lg font-semibold">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  className={`transition-colors ${
                    selectedCategory === cat.value
                      ? "text-[#1D6CE0] underline"
                      : "text-white/80 hover:text-white"
                  }`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>
        </section>
      )}

      {/* MOST POPULAR MOVIES */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-10 mt-10 mb-10 px-6">
        <div className="flex flex-row md:flex-col gap-4 md:gap-6">
          {mostPopular.map((film) => (
            <MovieCard key={film.id} film={film} />
          ))}
        </div>

        <div className="max-w-md text-center md:text-left">
          <h2 className="text-3xl font-bold mb-4 text-white">Most Popular Movies</h2>
          <p className="text-gray-400 mb-8">
            Découvrez les films les plus populaires du moment et explorez leurs détails en un clic.
          </p>

          {featured && (
            <Link
              to="/film/$id"
              params={{ id: featured.id }}
              className="inline-flex items-center gap-2 rounded-full bg-[#1D6CE0] px-8 py-3 font-bold text-white shadow-lg hover:bg-[#174ea6] transition"
            >
              ▶ Watch now
            </Link>
          )}
        </div>
      </section>

      {/* TOP SERIES & FILMS */}
      <section className="mx-auto max-w-6xl px-6 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">Top series</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {topSeries.map((film) => (
                <MovieCard key={film.id} film={film} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">Top Films</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {topFilms.map((film) => (
                <MovieCard key={film.id} film={film} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STUDIOS LOGOS */}
      <footer className="mt-16 flex flex-wrap justify-center items-center gap-10 py-10 border-t border-white/10 bg-[#050B1C]">
        <img src="/disney.png" alt="Disney+" className="h-8 opacity-80" />
        <img src="/marvel.png" alt="Marvel" className="h-8 opacity-80" />
        <img src="/cartoon-network.png" alt="Cartoon Network" className="h-8 opacity-80" />
        <img src="/netflix.png" alt="Netflix" className="h-8 opacity-80" />
        <img src="/starwars.png" alt="Star Wars" className="h-8 opacity-80" />
      </footer>
    </main>
  )
}