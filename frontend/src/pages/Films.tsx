import React, { useMemo } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useFilms } from "../hooks/useFilms"
import { useCategories } from "../hooks/useCategories"
import { SearchBar } from "../components/films/SearchBar"
import { CategoryPills } from "../components/films/CategoryPills"
import { FilmCard } from "../components/films/FilmCard"
import type { Film } from "../types"
import { isSeriesFilmListed, normalizeFilmToken } from "../lib/filmKind"

export function Films() {
  const { q, category, type } = useSearch({ from: "/films" })
  const navigate = useNavigate({ from: "/films" })

  const patchSearch = (
    patch: Partial<{
      q: string
      category: string
      type: "movie" | "series" | "all"
      sort: "" | "viewed" | "popular" | "recent"
    }>,
  ) => {
    navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
    })
  }

  const hasSearchQuery = q.trim() !== ""
  const effectiveCategory = hasSearchQuery ? "" : category

  const { data: categories = [], isLoading: loadingCategories } = useCategories()
  const { data: films, isLoading, error } = useFilms(q, effectiveCategory, "")

  const filteredCategories = useMemo(() => {
    const byName = new Map(
      categories.map((c) => [normalizeFilmToken(c.name), c] as const),
    )

    const preferredGroups = [
      ["action", "actio"],
      ["drama", "drame", "drames"],
      ["movie", "movies", "film", "films"],
      ["animation", "annimation"],
      ["comedie", "comedy"],
      ["serie", "series"],
      ["horreur", "horror", "horeur"],
      ["family", "famamily", "familial"],
    ]

    const picked: typeof categories = []
    const added = new Set<string>()

    for (const group of preferredGroups) {
      const found = group
        .map((key) => byName.get(key))
        .find((cat): cat is (typeof categories)[number] => Boolean(cat))
      if (found && !added.has(found.id)) {
        picked.push(found)
        added.add(found.id)
      }
    }

    return picked
  }, [categories])

  const list = useMemo<Film[]>(() => {
    const base = Array.isArray(films) ? (films as Film[]) : []

    let afterCategory: Film[]
    if (!category || hasSearchQuery) {
      afterCategory = base
    } else {
      const selected = normalizeFilmToken(category)
      afterCategory = base.filter((film) =>
        (film.categories ?? []).some((c) => normalizeFilmToken(c) === selected),
      )
    }

    if (type === "series") return afterCategory.filter(isSeriesFilmListed)
    if (type === "movie") return afterCategory.filter((f) => !isSeriesFilmListed(f))
    return afterCategory
  }, [films, category, hasSearchQuery, type])

  const isBusy = isLoading || loadingCategories

  const hasNoResults =
    !isBusy && !error && list.length === 0 && (hasSearchQuery || category !== "")

  const isCatalogEmpty =
    !isBusy && !error && list.length === 0 && !hasSearchQuery && category === ""

  const titleLabel = q || category ? "Recherche" : "Catalogue"
  const subtitleLabel = q
    ? `Résultats pour “${q.trim()}”`
    : category
      ? `Catégorie : ${category}`
      : "Explore tous les films & séries disponibles"

  return (
    <main className="films-page min-h-screen bg-[#050B1C] text-white pb-24">
      <section className="mx-auto max-w-7xl px-6 md:px-12 pt-20">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{titleLabel}</h1>
          <p className="text-white/60">{subtitleLabel}</p>
        </div>

        <div className="sticky top-4 z-30 space-y-3">
          <div className="films-search-shell rounded-lg border border-white/10 bg-[#0A132D]/70 px-2 py-1.5 shadow-md backdrop-blur-md md:px-3 md:py-2">
            <SearchBar
              value={q}
              onChange={(v) => patchSearch({ q: v })}
              placeholder="Rechercher un film, une série ou un réalisateur…"
            />
          </div>

          {!isCatalogEmpty && (
            <div className="films-category-shell rounded-2xl border border-white/10 bg-[#0A132D]/70 p-2 backdrop-blur-xl">
              <CategoryPills
                categories={filteredCategories}
                selectedCategory={category}
                onCategoryChange={(c) => patchSearch({ category: c })}
              />
            </div>
          )}
        </div>

        {isCatalogEmpty && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#0A132D]/60 p-6 text-center text-white/70">
            Aucun film trouvé pour le moment. Vérifie que tes films sont bien ajoutés en base,
            puis recharge la page.
          </div>
        )}
      </section>

      {isBusy && (
        <div className="flex h-[45vh] items-center justify-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#1D6CE0]"
            aria-label="Chargement"
            role="status"
          />
        </div>
      )}

      {!isBusy && error && (
        <div className="mx-auto mt-10 max-w-7xl px-6 md:px-12">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
            {error.message}
          </div>
        </div>
      )}

      {!isBusy && !error && (
        <>
          {isCatalogEmpty && (
            <section className="mx-auto mt-14 max-w-2xl px-6 text-center">
              <div className="mb-6 mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <span className="text-4xl" aria-hidden="true">
                  🍿
                </span>
              </div>

              <h2 className="mb-3 text-3xl font-semibold">Votre catalogue est vide</h2>
              <p className="mb-8 text-base md:text-lg leading-relaxed text-white/60">
                Recherchez un film avec la barre ci-dessus pour le trouver dans la base de données.
              </p>
            </section>
          )}

          {hasNoResults && (
            <section className="mx-auto mt-10 max-w-2xl px-6 text-center">
              <div className="films-empty-shell rounded-2xl border border-white/10 bg-white/5 p-8">
                <p className="text-lg text-white/70">
                  Aucun film trouvé pour{" "}
                  <span className="font-bold text-[#3EA6FF]">“{q.trim() || category}”</span>
                </p>

                <button
                  type="button"
                  onClick={() =>
                    patchSearch({ q: "", category: "", type: "all", sort: "" })
                  }
                  className="mt-8 rounded-full border border-white/10 bg-white/5 px-8 py-3 font-bold text-white transition-all hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B1C]"
                >
                  Réinitialiser
                </button>
              </div>
            </section>
          )}

          {!hasNoResults && !isCatalogEmpty && list.length > 0 && (
            <section className="mx-auto max-w-7xl px-6 md:px-12 mt-10 pb-24">
              <div className="mb-5 flex items-end justify-between gap-4">
                <h3 className="text-xl md:text-2xl font-semibold">
                  {q || category ? "Résultats" : "Tout le catalogue"}
                </h3>
                <span className="text-sm font-medium text-white/50">
                  {list.length} titre{list.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
                {list.map((film, idx) => (
                  <div
                    key={film.id}
                    className="cine-card-enter"
                    style={{ ["--stagger" as any]: `${Math.min(idx * 22, 260)}ms` }}
                  >
                    <FilmCard film={film} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}
