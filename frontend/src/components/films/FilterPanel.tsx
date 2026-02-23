import React from "react"
import type { Category } from "../../types"

interface FilterPanelProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  year: string
  onYearChange: (year: string) => void
}

export function FilterPanel({ categories, selectedCategory, onCategoryChange, year, onYearChange }: FilterPanelProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end mb-6 mt-4">
      <div>
        <label className="block text-sm font-medium mb-1">Catégorie</label>
        <select
          className="rounded border px-3 py-2"
          value={selectedCategory}
          onChange={e => onCategoryChange(e.target.value)}
        >
          <option value="">Toutes</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Année</label>
        <input
          className="rounded border px-3 py-2"
          type="text"
          value={year}
          onChange={e => onYearChange(e.target.value)}
          placeholder="ex: 2020"
        />
      </div>
    </div>
  )
}
