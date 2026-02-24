import React from "react"
import type { Category } from "../../types"

interface FilterPanelProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  year: string
  onYearChange: (year: string) => void
}

function Chip({
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
        "rounded-full px-4 py-2 text-sm font-medium transition",
        "border border-white/15",
        active
          ? "bg-[#1D6CE0] text-white border-transparent"
          : "bg-white/5 text-white/80 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

export function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  year,
  onYearChange,
}: FilterPanelProps) {
  return (
    <div className="mt-6 flex flex-col gap-5">
      {/* Chips */}
      <div className="flex flex-wrap gap-3">
        <Chip active={!selectedCategory} onClick={() => onCategoryChange("")}>
          Tous
        </Chip>

        {categories.map((cat) => (
          <Chip
            key={cat.id}
            active={selectedCategory === cat.name}
            onClick={() => onCategoryChange(cat.name)}
          >
            {cat.name}
          </Chip>
        ))}
      </div>

      {/* Year */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-white/70">Année</label>
        <input
          className="h-10 w-32 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1D6CE0]/70"
          type="text"
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          placeholder="ex: 2020"
          inputMode="numeric"
        />

        {(selectedCategory || year) && (
          <button
            type="button"
            onClick={() => {
              onCategoryChange("")
              onYearChange("")
            }}
            className="text-sm text-white/70 hover:text-white"
          >
            Réinitialiser filtres
          </button>
        )}
      </div>
    </div>
  )
}