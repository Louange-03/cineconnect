import React from "react"
import type { Category } from "../../types"

interface CategoryPillsProps {
    categories: Category[]
    selectedCategory: string
    onCategoryChange: (id: string) => void
}

function Pill({
    active,
    children,
    onClick,
}: {
    active: boolean
    children: React.ReactNode
    onClick: () => void
}) {
    const base =
        "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 border"
    const activeCls =
        "bg-[#FFC107] text-[#050B1C] border-[#FFC107]/40 shadow-[0_0_15px_rgba(255,193,7,0.35)]"
    const idleCls =
        "bg-white/5 text-gray-300/70 border-white/10 hover:bg-white/10 hover:text-white"

    return (
        <button
            type="button"
            onClick={onClick}
            className={`${base} ${active ? activeCls : idleCls} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC107]/40`}
        >
            {children}
        </button>
    )
}

export function CategoryPills({
    categories,
    selectedCategory,
    onCategoryChange,
}: CategoryPillsProps) {
    if (!categories?.length) return null

    return (
        <div className="mx-auto mt-6 w-full max-w-7xl px-6 md:px-12">
            <div className="flex gap-3 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
                <Pill active={!selectedCategory} onClick={() => onCategoryChange("")}>
                    Tous
                </Pill>

                {categories.map((cat) => (
                    <Pill
                        key={cat.id}
                        active={selectedCategory === cat.name}
                        onClick={() => onCategoryChange(cat.name)}
                    >
                        {cat.name}
                    </Pill>
                ))}

                {/*
        // Optionnel : un vrai dropdown “Autres” plus tard (quand tu veux)
        <button
          type="button"
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300/70 transition-all duration-300 hover:bg-white/10 hover:text-white"
        >
          Autres
        </button>
        */}
            </div>
        </div>
    )
}