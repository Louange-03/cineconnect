

import React, { useState } from "react"
import { useFilms } from "../hooks/useFilms"
import { useCategories } from "../hooks/useCategories"
import { SearchBar } from "../components/films/SearchBar"
import { FilmGrid } from "../components/films/FilmGrid"
import { FilterPanel } from "../components/films/FilterPanel"

export function Films() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [year, setYear] = useState("")
  const { data: categories = [], isLoading: loadingCategories } = useCategories()
  const { data: films, isLoading, error } = useFilms(query, category, year)

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-4">Films</h1>
      <SearchBar value={query} onChange={setQuery} placeholder="Rechercher un film..." />
      <FilterPanel
        categories={categories}
        selectedCategory={category}
        onCategoryChange={setCategory}
        year={year}
        onYearChange={setYear}
      />

      {isLoading || loadingCategories ? <p className="mt-6">Chargement...</p> : null}
      {error && <p className="mt-6 text-red-600">{error.message}</p>}

      {films && <FilmGrid films={films} />}
    </div>
  )
}