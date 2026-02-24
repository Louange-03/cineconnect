import React, { useState } from "react"
import { useFilms } from "../hooks/useFilms.omdb"
import { useCategories } from "../hooks/useCategories"
import { SearchBar } from "../components/films/SearchBar"
import { FilmGrid } from "../components/films/FilmGrid"
import { FilterPanel } from "../components/films/FilterPanel"
import { OmdbImportPanel } from "../components/films/OmdbImportPanel"

export function Films() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [year, setYear] = useState("")

  const { data: categories = [], isLoading: loadingCategories } = useCategories()
  const { data: films, isLoading, error } = useFilms(query, category, year)

  const hasNoResults =
    !isLoading &&
    !loadingCategories &&
    !error &&
    Array.isArray(films) &&
    films.length === 0 &&
    (query || category || year)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12">
      {/* HERO */}
      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
        Catalogue de <span className="text-[#1D6CE0]">films</span>
      </h1>

      <p className="mt-4 text-lg md:text-xl text-white/70 max-w-2xl">
        Recherchez parmi des millions de films du monde entier.
      </p>

      {/* SEARCH BAR */}
      <div className="mt-10 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Rechercher un film, un réalisateur..."
          />
        </div>

        <button
          type="button"
          className="h-[52px] px-8 rounded-xl font-semibold bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] hover:brightness-110 transition"
        >
          Rechercher
        </button>
      </div>

      {/* FILTERS */}
      <div className="mt-8">
        <FilterPanel
          categories={categories}
          selectedCategory={category}
          onCategoryChange={setCategory}
          year={year}
          onYearChange={setYear}
        />
      </div>

      {/* STATES */}
      {(isLoading || loadingCategories) && (
        <div className="mt-16 text-white/70 text-lg">Chargement des films...</div>
      )}

      {error && (
        <div className="mt-16 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          {error.message}
        </div>
      )}

      {/* EMPTY STATE */}
      {hasNoResults && (
        <div className="mt-24 text-center">
          <p className="text-xl text-white/70">
            Aucun film trouvé pour{" "}
            <span className="text-white font-semibold">
              "{query || category || year}"
            </span>
          </p>

          <button
            type="button"
            onClick={() => {
              setQuery("")
              setCategory("")
              setYear("")
            }}
            className="mt-6 px-6 py-3 rounded-xl bg-[#1D6CE0] hover:brightness-110 font-semibold"
          >
            Réinitialiser la recherche
          </button>
        </div>
      )}

      {/* GRID */}
      {films && Array.isArray(films) && films.length > 0 && (
        <div className="mt-12">
          <FilmGrid films={films} />
        </div>
      )}
    </div>
  )
}