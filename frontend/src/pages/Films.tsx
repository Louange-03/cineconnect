import React, { useMemo, useState } from "react"
import { useFilms } from "../hooks/useFilms"
import { useCategories } from "../hooks/useCategories"
import { SearchBar } from "../components/films/SearchBar"
import { OmdbImportPanel } from "../components/films/OmdbImportPanel"
import { HeroFeature } from "../components/films/HeroFeature"
import { MovieRow } from "../components/films/MovieRow"
import { CategoryPills } from "../components/films/CategoryPills"

export function Films() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")

  const { data: categories = [], isLoading: loadingCategories } = useCategories()
  const { data: films, isLoading, error } = useFilms(query, category, "")

  const list = useMemo(() => (Array.isArray(films) ? films : []), [films])

  const isBusy = isLoading || loadingCategories

  const hasNoResults =
    !isBusy && !error && list.length === 0 && (query.trim() !== "" || category !== "")

  const isCatalogEmpty =
    !isBusy && !error && list.length === 0 && query.trim() === "" && category === ""

  const canImportFromOmdb = query.trim().length >= 3

  const featuredFilm = useMemo(() => {
    if (list.length === 0) return undefined
    return list.find((f) => f.posterUrl) ?? list[0]
  }, [list])

  const rows = useMemo(() => {
    if (list.length === 0) return { mostViewed: [], mostPopular: [], newlyAdded: [] }
    return {
      mostViewed: list.slice(0, 8),
      mostPopular: list.slice(8, 16),
      newlyAdded: list.slice(16, 24),
    }
  }, [list])

  const showHero = !isBusy && !error && !!featuredFilm && query.trim() === "" && category === ""

  return (
    <main className="min-h-screen bg-[#050B1C] pb-24">
      {/* Loading */}
      {isBusy && (
        <div className="flex h-[50vh] items-center justify-center text-lg text-white/70">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#1D6CE0]"
            aria-label="Chargement"
            role="status"
          />
        </div>
      )}

      {/* Error */}
      {!isBusy && error && (
        <div className="mx-auto mt-16 max-w-6xl rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          {error.message}
        </div>
      )}

      {/* Hero */}
      {showHero && featuredFilm && <HeroFeature film={featuredFilm} />}

      {/* Search (sticky for better UX) */}
      <div
        className={[
          "mx-auto w-full max-w-7xl px-6 md:px-12",
          "transition-all duration-500",
          showHero ? "-mt-8 relative z-20" : "pt-20",
          "sticky top-0 z-30",
        ].join(" ")}
      >
        <div className="rounded-2xl border border-white/10 bg-[#0A132D]/80 p-2 shadow-2xl backdrop-blur-xl md:p-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Rechercher des films, réalisateurs, genres..."
          />
        </div>
      </div>

      {/* Content */}
      {!isBusy && !error && (
        <>
          {/* Category pills */}
          {!isCatalogEmpty && (
            <CategoryPills
              categories={categories}
              selectedCategory={category}
              onCategoryChange={setCategory}
            />
          )}

          {/* Empty catalog */}
          {isCatalogEmpty && (
            <section className="mx-auto mt-24 flex max-w-2xl flex-col items-center px-4 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <span className="text-4xl" aria-hidden="true">
                  🍿
                </span>
              </div>

              <h2 className="mb-4 text-3xl font-black text-white">Votre catalogue est vide</h2>

              <p className="mb-10 text-lg leading-relaxed text-gray-400">
                CinéConnect est connecté à OMDb. Recherchez un film avec la barre ci-dessus
                pour commencer à remplir votre base de données locale.
              </p>

              {canImportFromOmdb && (
                <div className="w-full text-left">
                  <OmdbImportPanel initialQuery={query} />
                </div>
              )}
            </section>
          )}

          {/* No results */}
          {hasNoResults && (
            <section className="mx-auto mt-16 max-w-2xl px-4 text-center">
              <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-xl text-white/70">
                Aucun film local trouvé pour{" "}
                <span className="font-bold text-[#1D6CE0]">
                  "{query.trim() || category}"
                </span>
              </p>

              {canImportFromOmdb ? (
                <div className="mt-8 text-left motion-safe:animate-fade-in">
                  <OmdbImportPanel initialQuery={query} />
                </div>
              ) : (
                <div className="mt-8 text-gray-500 motion-safe:animate-pulse">
                  Tapez au moins 3 caractères pour rechercher sur OMDb...
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setCategory("")
                }}
                className="mt-12 rounded-full border border-white/10 bg-white/5 px-8 py-3.5 font-bold text-white transition-all hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
              >
                Annuler la recherche
              </button>
            </section>
          )}

          {/* Rows */}
          {!hasNoResults && !isCatalogEmpty && list.length > 0 && (
            <section className="mt-8 space-y-4">
              {query.trim() !== "" || category !== "" ? (
                <MovieRow title="Résultats de recherche" films={list} />
              ) : (
                <>
                  <MovieRow title="Les plus vus" films={rows.mostViewed} showAllLink="/films?sort=viewed" />
                  {rows.mostPopular.length > 0 && (
                    <MovieRow title="Tendances actuelles" films={rows.mostPopular} showAllLink="/films?sort=popular" />
                  )}
                  {rows.newlyAdded.length > 0 && (
                    <MovieRow title="Nouveautés" films={rows.newlyAdded} showAllLink="/films?sort=recent" />
                  )}
                </>
              )}
            </section>
          )}
        </>
      )}
    </main>
  )
}