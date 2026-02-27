import React from "react";
import type { Film } from "../../types";
import { Link } from "@tanstack/react-router";

interface HeroFeatureProps {
    film: Film;
}

export function HeroFeature({ film }: HeroFeatureProps) {
    const poster =
        film.posterUrl ||
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop";

    return (
        <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] flex items-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
                <img
                    src={poster}
                    alt={film.title}
                    className="w-full h-full object-cover"
                />
                {/* Gradients to blend with background */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050B1C] via-[#050B1C]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050B1C] via-[#050B1C]/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end h-full pb-20 mt-10">
                {/* Title */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-wider mb-4 leading-tight drop-shadow-xl font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {film.title}
                </h1>

                {/* Info Row: Year, Categories */}
                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300 mb-6 font-medium">
                    {film.year && (
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white backdrop-blur-sm border border-white/10">{film.year}</span>
                    )}
                    {film.categories?.slice(0, 3).map((category) => (
                        <span key={category} className="uppercase tracking-wider">
                            {category}
                        </span>
                    ))}
                </div>

                {/* Synopsis snippet */}
                <p className="max-w-xl text-gray-300 text-lg mb-8 line-clamp-3 leading-relaxed">
                    {film.synopsis || "Un chef-d'œuvre cinématographique à découvrir."}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/film/$id"
                        params={{ id: film.id }}
                        className="flex items-center gap-2 bg-[#1D6CE0] hover:bg-[#3EA6FF] text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(29,108,224,0.4)]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                        </svg>
                        Play Now
                    </Link>
                    <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
