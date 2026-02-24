import React from "react"
import { Link, useParams } from "@tanstack/react-router"
import { useFilms } from "../hooks/useFilms"
import { FilmGrid } from "../components/films/FilmGrid"

export function FilmsByCategory() {
  const { categorie } = useParams({} as any) as { categorie: string }
  const { data: films, isLoading, error } = useFilms("", categorie, "")

  const hasNoResults = !isLoading && !error && Array.isArray(films) && films.length === 0

  return (
    <div className="min-h-screen bg-[#050B1C] text-white">
      {/* Container */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
          Catalogue de <span className="text-[#1D6CE0]">films</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-white/70">
          Recherchez parmi des millions de films du monde entier.
        </p>

        {/* Category context */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
            Catégorie : <span className="text-white font-medium">{categorie}</span>
          </span>

          <Link
            to="/films"
            className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 hover:bg-white/15"
          >
            Réinitialiser la recherche
          </Link>
        </div>

        {/* Content area */}
        <div className="mt-10">
          {isLoading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
              Chargement...
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
              {error.message}
            </div>
          )}

          {hasNoResults && (
            <div className="mt-20 text-center">
              <p className="text-lg text-white/65">
                Aucun film trouvé pour "<span className="text-white">{categorie}</span>"
              </p>

              <Link
                to="/films"
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#1D6CE0] px-6 py-3 font-semibold hover:brightness-110"
              >
                Réinitialiser la recherche
              </Link>
            </div>
          )}

          {films && Array.isArray(films) && films.length > 0 && (
            <div className="mt-6">
              <FilmGrid films={films} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}