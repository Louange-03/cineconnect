import React from "react"
import type { Category } from "../../types"

interface FilterPanelProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (cat: string) => void
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-11 px-5 rounded-full border transition font-semibold",
        active
          ? "bg-[#1D6CE0] border-transparent text-white"
          : "bg-transparent border-white/15 text-white/80 hover:bg-white/10",
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
}: FilterPanelProps) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
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
  )
}