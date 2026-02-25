import React, { useMemo, useState } from "react"
import { useFilms } from "../hooks/useFilms"
import { useCategories } from "../hooks/useCategories"
import { SearchBar } from "../components/films/SearchBar"
import { FilmGrid } from "../components/films/FilmGrid"
import { FilmList } from "../components/films/FilmList"
import { FilterPanel } from "../components/films/FilterPanel"
import { OmdbImportPanel } from "../components/films/OmdbImportPanel"

type ViewMode = "grid" | "list"

function IconButton({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-[52px] w-[52px] rounded-2xl border transition grid place-items-center font-semibold",
        active
          ? "bg-white/10 border-white/20 text-white"
          : "bg-transparent border-white/15 text-white/80 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

export function Films() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [view, setView] = useState<ViewMode>("grid")
  return (
    <div className="min-h-screen bg-[#0a1832] text-white">
      <div className="max-w-5xl mx-auto px-4 pt-12">
        <h1 className="text-5xl font-extrabold mb-2 tracking-tight">
          Catalogue de <span className="text-[#3ca3f5]">films</span>
        </h1>
        <p className="mb-10 text-lg text-blue-100">Recherchez parmi des millions de films du monde entier.</p>
        <div className="flex flex-col gap-4 mb-6">
          <SearchBar value={query} onChange={setQuery} placeholder="Rechercher un film, un réalisateur..." />
        </div>
        <FilterPanel
          categories={categories}
          selectedCategory={category}
          onCategoryChange={setCategory}
        />
        {isLoading || loadingCategories ? <p className="mt-6">Chargement...</p> : null}
        {error && <p className="mt-6 text-red-400">{error.message}</p>}
        {films && <FilmGrid films={films} />}
      </div>
    </div>
  )
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

        <IconButton active={view === "grid"} onClick={() => setView("grid")}>
          ▦
        </IconButton>
        <IconButton active={view === "list"} onClick={() => setView("list")}>
          ≡
        </IconButton>
      </div>

      {/* CATEGORY CHIPS */}
      <FilterPanel
        categories={categories}
        selectedCategory={category}
        onCategoryChange={setCategory}
      />

      {/* STATES */}
      {(isLoading || loadingCategories) && (
        <div className="mt-16 text-white/70 text-lg">Chargement…</div>
      )}

      {error && (
        <div className="mt-16 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          {error.message}
        </div>
      )}

      {/* EMPTY STATE CENTER (exact maquette) */}
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

          {/* ✅ OMDb fallback (si recherche texte) */}
          {query.trim().length >= 3 && (
            <OmdbImportPanel initialQuery={query} />
          )}
        </div>
      )}

      {/* RESULTS */}
      {!hasNoResults && list.length > 0 && (
        <>
          {view === "grid" ? <FilmGrid films={list} /> : <FilmList films={list} />}
        </>
      )}
    </div>
  )
}