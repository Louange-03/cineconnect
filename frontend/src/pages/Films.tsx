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

  const hasNoResults =
    !isLoading &&
    !loadingCategories &&
    !error &&
    list.length === 0 &&
    (query || category)

  const isCatalogEmpty =
    !isLoading &&
    !loadingCategories &&
    !error &&
    list.length === 0 &&
    !query &&
    !category

  // Simulation of a featured movie (first one with a poster, or fallback)
  const featuredFilm = list.find(f => f.posterUrl) || list[0]

  // Simulation of rows based on the API response
  const mostViewed = list.slice(0, 8);
  const mostPopular = list.slice(8, 16);
  const newlyAdded = list.slice(16, 24);

  return (
    <div className="min-h-screen bg-[#050B1C] pb-24">
      {/* LOADING / ERROR STATE BEFORE PAGE */}
      {(isLoading || loadingCategories) && (
        <div className="flex h-[50vh] items-center justify-center text-white/70 text-lg">
          <div className="w-10 h-10 border-4 border-white/20 border-t-[#1D6CE0] rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="mt-16 mx-auto max-w-6xl text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          {error.message}
        </div>
      )}

      {/* HERO SECTION - Only visible if there is a featured film */}
      {!isLoading && !error && featuredFilm && !query && !category && (
        <HeroFeature film={featuredFilm} />
      )}

      {/* SEARCH SECTION */}
      <div className={`mx-auto w-full max-w-7xl px-6 md:px-12 transition-all duration-500 ${!query && !category && featuredFilm ? '-mt-8 relative z-20' : 'pt-24 hover:bg-black/20'}`}>
        <div className="bg-[#0A132D]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 md:p-4 flex flex-col md:flex-row gap-4 items-center shadow-2xl">
          <div className="flex-1 w-full">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Rechercher des films, réalisateurs, genres..."
            />
          </div>
        </div>
      </div>

      {!isLoading && !error && (
        <>
          {/* CAROUSEL CHIPS - Only visible if not totally empty catalog */}
          {!isCatalogEmpty && (
            <CategoryPills
              categories={categories}
              selectedCategory={category}
              onCategoryChange={setCategory}
            />
          )}

          {/* CATALOG IS COMPLETELY EMPTY */}
          {isCatalogEmpty && (
            <div className="mt-24 text-center max-w-2xl mx-auto px-4 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <span className="text-4xl">🍿</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Votre catalogue est vide</h2>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                CinéConnect est connecté à OMDb. Recherchez n'importe quel film avec la barre de recherche ci-dessus pour commencer à remplir votre base de données locale !
              </p>
              {query.trim().length >= 3 && (
                <div className="w-full text-left">
                  <OmdbImportPanel initialQuery={query} />
                </div>
              )}
            </div>
          )}

          {/* SEARCH RETURNED NO RESULTS */}
          {hasNoResults && (
            <div className="mt-16 text-center max-w-2xl mx-auto px-4">
              <p className="text-xl text-white/70 bg-white/5 p-8 rounded-2xl border border-white/10">
                Aucun film local trouvé pour{" "}
                <span className="text-[#1D6CE0] font-bold">
                  "{query || category}"
                </span>
              </p>

              {query.trim().length >= 3 ? (
                <div className="mt-8 text-left animate-fade-in">
                  <OmdbImportPanel initialQuery={query} />
                </div>
              ) : (
                <div className="mt-8 text-gray-500 animate-pulse">
                  Tapez au moins 3 caractères pour rechercher sur OMDb...
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setCategory("")
                }}
                className="mt-12 px-8 py-3.5 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold transition-all"
              >
                Annuler la recherche
              </button>
            </div>
          )}

          {/* RESULTS ROWS */}
          {!hasNoResults && !isCatalogEmpty && list.length > 0 && (
            <div className="mt-8 space-y-4">
              {query || category ? (
                <MovieRow title="Résultats de recherche" films={list} />
              ) : (
                <>
                  <MovieRow title="Les plus vus" films={mostViewed} showAllLink="/films?sort=viewed" />
                  {mostPopular.length > 0 && <MovieRow title="Tendances actuelles" films={mostPopular} showAllLink="/films?sort=popular" />}
                  {newlyAdded.length > 0 && <MovieRow title="Nouveautés" films={newlyAdded} showAllLink="/films?sort=recent" />}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
