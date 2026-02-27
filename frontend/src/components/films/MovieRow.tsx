import React, { useRef } from "react"
import type { Film } from "../../types"
import { FilmCard } from "./FilmCard"
import { Link } from "@tanstack/react-router"

interface MovieRowProps {
    title: string
    films: Film[]
    showAllLink?: string
}

export function MovieRow({ title, films, showAllLink }: MovieRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return

        const container = scrollRef.current
        const scrollAmount = container.clientWidth * 0.8

        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        })
    }

    if (!films?.length) return null

    return (
        <section className="relative mx-auto w-full max-w-7xl px-6 py-8 md:px-12">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-wide text-white md:text-3xl">
                    {title}
                </h2>

                {showAllLink && (
                    <Link
                        to={showAllLink}
                        className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
                    >
                        Voir tout
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-4 w-4"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    </Link>
                )}
            </div>

            {/* Slider */}
            <div className="group relative">
                {/* Left button */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-[-18px] top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-[#1D6CE0] group-hover:opacity-100"
                    aria-label="Scroll gauche"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>

                {/* Row */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto py-4 scroll-smooth snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none" }}
                >
                    {films.map((film) => (
                        <div
                            key={film.id}
                            className="min-w-[180px] shrink-0 snap-start md:min-w-[220px] motion-safe:animate-fade-in"
                        >
                            <FilmCard film={film} />
                        </div>
                    ))}
                </div>

                {/* Right button */}
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-[-18px] top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-[#1D6CE0] group-hover:opacity-100"
                    aria-label="Scroll droite"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>

                {/* Gradient right */}
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-[#050B1C] to-transparent" />

                {/* Gradient left */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-r from-[#050B1C] to-transparent opacity-0 group-hover:opacity-100 transition" />
            </div>
        </section>
    )
}