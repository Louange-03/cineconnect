import React from "react"
import { useParams, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { Film } from "../types"
import { ReviewForm } from "../components/reviews/ReviewForm"
import { ReviewCard } from "../components/reviews/ReviewCard"
import { useReviews } from "../hooks/useReviews"

async function fetchFilm(id: string): Promise<Film | null> {
  const res = await fetch(`/api/films/${id}`, {
    headers: { Accept: "application/json" },
  })

  if (!res.ok) throw new Error("Film introuvable")

  const contentType = res.headers.get("content-type") || ""
  const text = await res.text()
  if (!contentType.includes("application/json")) {
    throw new Error("Réponse invalide du serveur (pas du JSON)")
  }

  const data = JSON.parse(text)
  return data.film ?? null
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] px-3.5 py-1.5 font-medium rounded-full bg-white/5 text-[#FFC107] border border-white/10 shadow-[0_0_10px_rgba(255,193,7,0.1)]">
      {children}
    </span>
  )
}

export function FilmDetail() {
  const { id } = useParams({} as any) as { id: string }

  const { data: film, isLoading, error } = useQuery<Film | null, Error>({
    queryKey: ["film", id],
    queryFn: () => fetchFilm(id),
    enabled: !!id,
  })

  const { data: reviews, isLoading: loadingReviews } = useReviews(id)

  if (isLoading) {
    return (
      <div className="min-h-[85vh] bg-[#050B1C] flex items-center justify-center pt-12">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#1D6CE0] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[85vh] bg-[#050B1C] mx-auto w-full px-4 pt-24 text-center">
        <div className="inline-block rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-red-200">
          <span className="text-4xl mb-4 block">⚠️</span>
          {error.message}
        </div>
      </div>
    )
  }

  if (!film) {
    return (
      <div className="min-h-[85vh] bg-[#050B1C] mx-auto w-full px-4 pt-24 text-center">
        <div className="inline-block rounded-2xl border border-white/10 bg-white/5 p-8 text-white/70">
          <span className="text-4xl mb-4 block">🎬</span>
          Ce film n'existe pas ou a été retiré.
        </div>
      </div>
    )
  }

  const poster =
    film.posterUrl ||
    "https://via.placeholder.com/900x1350/0b1020/ffffff?text=No+Image"

  return (
    <div className="min-h-[85vh] bg-[#050B1C] w-full px-4 pb-20 pt-10 relative overflow-hidden">

      {/* Background blurred poster for ambiance */}
      <div
        className="absolute top-0 left-0 w-full h-[50vh] opacity-20 blur-[100px] pointer-events-none z-0"
        style={{ backgroundImage: `url(${poster})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      ></div>
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-transparent to-[#050B1C] pointer-events-none z-0"></div>

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Back */}
        <div className="mb-8">
          <Link
            to="/films"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 py-2 px-4 rounded-full border border-white/10 hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Retour au catalogue
          </Link>
        </div>

        {/* HERO */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a1128]/80 backdrop-blur-xl shadow-2xl">
          <div className="grid md:grid-cols-[360px_1fr] gap-0">
            {/* Poster */}
            <div className="relative h-full">
              <div className="aspect-[2/3] md:aspect-auto md:h-full overflow-hidden p-4 md:p-6 pb-0 md:pb-6">
                <img
                  src={poster}
                  alt={film.title}
                  className="h-full w-full object-cover rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                />
              </div>
            </div>

            {/* Content */}
            <div className="relative p-6 md:p-10 md:pl-6 flex flex-col justify-center">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                {film.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-300 font-medium mb-6">
                {film.year && (
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#1D6CE0]"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                    {film.year}
                  </span>
                )}
                {film.createdAt && (
                  <span className="text-sm border-l border-white/20 pl-4">Ajouté récemment au catalogue</span>
                )}
              </div>

              {film.categories && film.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {film.categories.map((c) => (
                    <Chip key={c}>{c}</Chip>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-4 mb-10">
                <button
                  type="button"
                  className="rounded-full bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-8 py-4 font-bold text-white hover:brightness-110 transition-all shadow-[0_0_20px_rgba(29,108,224,0.4)] transform hover:-translate-y-1 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" /></svg>
                  Ajouter à ma liste
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-white/5 px-8 py-4 font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                  Partager
                </button>
              </div>

              {/* Synopsis */}
              <div>
                <h2 className="text-xl font-bold text-white mb-3">Synopsis</h2>
                <p className="text-gray-400 leading-relaxed max-w-2xl text-lg font-light">
                  {film.synopsis || "Aucun synopsis disponible pour ce film."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_380px]">
          {/* List */}
          <section>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
              <h2 className="text-3xl font-bold text-white">Suggestions et Avis</h2>
              {loadingReviews ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-[#FFC107] rounded-full animate-spin"></div>
              ) : (
                <span className="bg-[#FFC107]/10 text-[#FFC107] px-3 py-1 rounded-full text-sm font-bold border border-[#FFC107]/20">
                  {reviews?.length || 0} avis
                </span>
              )}
            </div>

            <div className="space-y-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((r) => <ReviewCard key={r.id} review={r} />)
              ) : (
                <div className="text-center p-12 rounded-3xl border border-white/10 bg-white/5 border-dashed">
                  <span className="text-5xl opacity-50 block mb-4">⭐</span>
                  <p className="text-gray-400 text-lg">Soyez le premier à partager votre avis sur ce film !</p>
                </div>
              )}
            </div>
          </section>

          {/* Form */}
          <aside className="h-fit rounded-3xl border border-white/10 bg-[#0a1128]/80 backdrop-blur-xl p-8 sticky top-28 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-2">Donnez votre avis</h3>
            <p className="text-gray-400 mb-8">
              Partagez votre critique avec la communauté CinéConnect.
            </p>
            <div className="mt-6">
              <ReviewForm filmId={id} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}