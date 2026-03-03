import React, { useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { useFilms } from "../hooks/useFilms"
import { MovieRow } from "../components/films/MovieRow"

export function Home() {
  const { data: all = [] } = useFilms("", "", "all", 60)

  const featured = useMemo(() => {
    if (!all.length) return undefined
    return all.find((f) => f.posterUrl) ?? all[0]
  }, [all])

  const rows = useMemo(() => {
    return {
      trending: all.slice(0, 12),
      action: all.filter(f => f.categories?.includes("Action")).slice(0, 12),
      drama: all.filter(f => f.categories?.includes("Drame")).slice(0, 12),
      animation: all.filter(f => f.categories?.includes("Animation")).slice(0, 12),
    }
  }, [all])

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      {featured && (
        <section className="relative h-[80vh] w-full overflow-hidden">
          <img
            src={featured.posterUrl}
            alt={featured.title}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6">
            <h1 className="text-6xl font-black">{featured.title}</h1>
            <p className="mt-6 max-w-xl text-gray-300 line-clamp-3">
              {featured.synopsis}
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                to="/film/$id"
                params={{ id: featured.id }}
                className="rounded-full bg-white px-8 py-3 font-bold text-black"
              >
                ▶ Lecture
              </Link>

              <Link
                to="/films"
                className="rounded-full border border-white/20 bg-white/10 px-8 py-3 font-bold"
              >
                Parcourir
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ROWS */}
      <section className="mt-10 space-y-10 px-6">
        <MovieRow title="🔥 Tendances" films={rows.trending} />
        <MovieRow title="💥 Action" films={rows.action} />
        <MovieRow title="🎭 Drame" films={rows.drama} />
        <MovieRow title="🎬 Animation" films={rows.animation} />
      </section>
    </main>
  )
}