import React, { useMemo, useState } from "react"
import { useFilms } from "../hooks/useFilms"
import { useCategories } from "../hooks/useCategories"
import { SearchBar } from "../components/films/SearchBar"
import { FilmGrid } from "../components/films/FilmGrid"
import { FilmList } from "../components/films/FilmList"
import { FilterPanel } from "../components/films/FilterPanel"
import { OmdbImportPanel } from "../components/films/OmdbImportPanel"

type ViewMode = "grid" | "list"

export function Films() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [view, setView] = useState<ViewMode>("grid")

  const { data: categories = [], isLoading: loadingCategories } = useCategories()
  const { data: films, isLoading, error } = useFilms(query, category, "")

  const list = useMemo(() => (Array.isArray(films) ? films : []), [films])

  const hasNoResults =
    !isLoading &&
    !loadingCategories &&
    !error &&
    list.length === 0 &&
    (query || category)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-12">
      <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
        Catalogue de <span className="text-[#1D6CE0]">films</span>
      </h1>

      <p className="mt-4 text-lg md:text-xl text-white/70 max-w-2xl">
        Recherchez parmi des millions de films du monde entier.
      </p>

      {/* SEARCH */}
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
          className="h-[52px] px-8 rounded-2xl font-semibold bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] hover:brightness-110 transition"
        >
          Rechercher
        </button>

        <button
          type="button"
          onClick={() => setView("grid")}
          className={[
            "h-[52px] w-[52px] rounded-2xl border grid place-items-center transition font-semibold",
            view === "grid"
              ? "bg-white/10 border-white/20 text-white"
              : "border-white/15 text-white/80 hover:bg-white/10",
          ].join(" ")}
        >
          ▦
        </button>

        <button
          type="button"
          onClick={() => setView("list")}
          className={[
            "h-[52px] w-[52px] rounded-2xl border grid place-items-center transition font-semibold",
            view === "list"
              ? "bg-white/10 border-white/20 text-white"
              : "border-white/15 text-white/80 hover:bg-white/10",
          ].join(" ")}
        >
          ≡
        </button>
      </div>

      {/* CHIPS */}
      <FilterPanel
        categories={categories}
        selectedCategory={category}
        onCategoryChange={setCategory}
      />

      {/* LOADING / ERROR */}
      {(isLoading || loadingCategories) && (
        <div className="mt-16 text-white/70 text-lg">Chargement…</div>
      )}

      {error && (
        <div className="mt-16 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          {error.message}
        </div>
      )}

      {/* EMPTY */}
      {hasNoResults && (
        <div className="mt-24 text-center">
          <p className="text-xl text-white/70">
            Aucun film trouvé pour{" "}
            <span className="text-white font-semibold">
              "{query || category}"
            </span>
          </p>

          <button
            type="button"
            onClick={() => {
              setQuery("")
              setCategory("")
            }}
            className="mt-6 px-7 py-3 rounded-2xl bg-[#1D6CE0] hover:brightness-110 font-semibold"
          >
            Réinitialiser la recherche
          </button>

          {query.trim().length >= 3 && (
            <OmdbImportPanel initialQuery={query} />
          )}
        </div>
      )}

      {/* RESULTS */}
      {!hasNoResults && list.length > 0 && (
        <div className="mt-10">
          {view === "grid" ? <FilmGrid films={list} /> : <FilmList films={list} />}
        </div>
      )}
    </div>
  )
}