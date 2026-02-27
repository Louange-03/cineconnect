import React, { useRef } from "react";
import type { Film } from "../../types";
import { FilmCard } from "./FilmCard";

interface MovieRowProps {
    title: string;
    films: Film[];
    showAllLink?: string;
}

export function MovieRow({ title, films, showAllLink }: MovieRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -600, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 600, behavior: "smooth" });
        }
    };

    if (!films || films.length === 0) return null;

    return (
        <div className="relative py-8 w-full max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                    {title}
                </h2>
                {showAllLink && (
                    <a
                        href={showAllLink}
                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        Voir tout
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m8.25 4.5 7.5 7.5-7.5 7.5"
                            />
                        </svg>
                    </a>
                )}
            </div>

            <div className="group relative">
                <button
                    onClick={scrollLeft}
                    className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/60 hover:bg-[#1D6CE0] text-white border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide py-4 snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {films.map((film) => (
                        <div key={film.id} className="min-w-[180px] md:min-w-[220px] snap-center shrink-0">
                            <FilmCard film={film} />
                        </div>
                    ))}
                </div>

                <button
                    onClick={scrollRight}
                    className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/60 hover:bg-[#1D6CE0] text-white border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm shadow-xl"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>

                {/* Gradients pour cacher les bords */}
                <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[#050B1C] to-transparent pointer-events-none z-10" />
            </div>
        </div>
    );
}
