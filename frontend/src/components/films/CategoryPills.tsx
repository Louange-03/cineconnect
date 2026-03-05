import React from "react"
import type { Category } from "../../types"

interface CategoryPillsProps {
    categories: Category[]
    selectedCategory: string
    onCategoryChange: (id: string) => void
    allLabel?: string
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
        "bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] text-white border-transparent shadow-[0_0_15px_rgba(29,108,224,0.4)]"
    const idleCls =
        "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={[
                base,
                active ? activeCls : idleCls,
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3EA6FF]/50",
            ].join(" ")}
        >
            {children}
        </button>
    )
}

export function CategoryPills({
    categories,
    selectedCategory,
    onCategoryChange,
    allLabel = "Tous",
}: CategoryPillsProps) {
    if (!categories?.length) return null

    const scrollerRef = React.useRef<HTMLDivElement | null>(null)

    // Auto-scroll vers le pill actif (mobile friendly)
    React.useEffect(() => {
        const el = scrollerRef.current
        if (!el) return
        const active = el.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
        if (!active) return
        active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    }, [selectedCategory])

    return (
        <div className="relative">
            {/* Fades left/right (effet Netflix) */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#050B1C] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#050B1C] to-transparent" />

            <div
                ref={scrollerRef}
                className="flex gap-3 overflow-x-auto pb-2 pt-1 hide-scrollbar md:flex-wrap md:overflow-visible"
            >
                <Pill active={!selectedCategory} onClick={() => onCategoryChange("")}>
                    {allLabel}
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
            </div>
        </div>
    )
}