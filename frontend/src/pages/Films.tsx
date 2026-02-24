

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
    <div className="min-h-screen bg-[#0a1832] text-white">
      <div className="max-w-5xl mx-auto px-4 pt-12">
        <h1 className="text-4xl font-bold mb-2">
          Catalogue de <span className="text-blue-400">films</span>
        </h1>
        <p className="mb-8 text-lg text-blue-100">Recherchez parmi des millions de films du monde entier.</p>
        <div className="flex gap-4 mb-6">
          <SearchBar value={query} onChange={setQuery} placeholder="Rechercher un film, un réalisateur..." />
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition">Rechercher</button>
        </div>
        <FilterPanel
          categories={categories}
          selectedCategory={category}
          onCategoryChange={setCategory}
          year={year}
          onYearChange={setYear}
        />
        {isLoading || loadingCategories ? <p className="mt-6">Chargement...</p> : null}
        {error && <p className="mt-6 text-red-400">{error.message}</p>}
        {films && <FilmGrid films={films} />}
      </div>
    </div>
  )
}