import React from "react";
import type { Category } from "../../types";

interface CategoryPillsProps {
    categories: Category[];
    selectedCategory: string;
    onCategoryChange: (id: string) => void;
}

export function CategoryPills({
    categories,
    selectedCategory,
    onCategoryChange,
}: CategoryPillsProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 mt-6">
            <div className="flex flex-wrap gap-3 items-center">
                <button
                    onClick={() => onCategoryChange("")}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${!selectedCategory
                            ? "bg-[#FFC107] text-[#050B1C] shadow-[0_0_15px_rgba(255,193,7,0.4)]"
                            : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                        }`}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onCategoryChange(cat.name)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-1 ${selectedCategory === cat.name
                                ? "bg-[#FFC107] text-[#050B1C] shadow-[0_0_15px_rgba(255,193,7,0.4)]"
                                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
                {/* Placeholder for "Autres" dropdown from mockup */}
                <button className="px-5 py-2.5 rounded-full text-sm font-semibold bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10 transition-all duration-300 flex items-center gap-2">
                    Other
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
