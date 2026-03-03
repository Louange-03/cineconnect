import React, { useMemo } from "react"
import { Link, useParams } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { Film } from "../types"
import { ReviewForm } from "../components/reviews/ReviewForm"
import { ReviewCard } from "../components/reviews/ReviewCard"
import { useReviews } from "../hooks/useReviews"

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  })

  const contentType = res.headers.get("content-type") || ""
  const text = await res.text()

  if (!res.ok) {
    try {
      if (contentType.includes("application/json")) {
        const json = JSON.parse(text)
        throw new Error(json?.message || "Erreur serveur")
      }
    } catch { }
    throw new Error("Film introuvable")
  }

  if (!contentType.includes("application/json")) {
    throw new Error("Réponse invalide du serveur")
  }

  return JSON.parse(text) as T
}

export function FilmDetail() {
  // ✅ ROUTE CORRECTE
  const { id } = useParams({ from: "/film/$id" })

  const { data: film, isLoading, error } = useQuery<Film | null, Error>({
    queryKey: ["film", id],
    queryFn: async () => {
      const data = await fetchJson<{ film?: Film | null }>(`/api/films/${id}`)
      return data.film ?? null
    },
    enabled: !!id,
  })

  const { data: reviews, isLoading: loadingReviews } = useReviews(id)

  const poster = useMemo(() => {
    return (
      film?.posterUrl ||
      "https://via.placeholder.com/900x1350/0b1020/ffffff?text=No+Image"
    )
  }, [film?.posterUrl])

  if (isLoading) {
    return (
      <main className="flex min-h-[85vh] items-center justify-center bg-[#050B1C]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#1D6CE0]" />
      </main>
    )
  }

  if (error || !film) {
    return (
      <main className="flex min-h-[85vh] items-center justify-center bg-[#050B1C] text-white">
        Film introuvable.
      </main>
    )
  }

  return (
    <main className="min-h-[85vh] bg-[#050B1C] px-6 py-12 text-white">
      <Link
        to="/films"
        className="mb-8 inline-block text-sm text-gray-400 hover:text-white"
      >
        ← Retour au catalogue
      </Link>

      <div className="grid gap-10 md:grid-cols-[350px_1fr]">
        <img
          src={poster}
          alt={film.title}
          className="w-full rounded-2xl border border-white/10 object-cover"
        />

        <div>
          <h1 className="text-4xl font-black">{film.title}</h1>

          {film.year && (
            <p className="mt-2 text-gray-400">Année : {film.year}</p>
          )}

          {film.categories?.length && (
            <div className="mt-4 flex flex-wrap gap-2">
              {film.categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-[#FFC107]"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          <p className="mt-6 text-gray-300">
            {film.synopsis || "Aucun synopsis disponible."}
          </p>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_380px]">
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            Avis ({reviews?.length || 0})
          </h2>

          <div className="space-y-6">
            {reviews?.length
              ? reviews.map((r) => <ReviewCard key={r.id} review={r} />)
              : <p className="text-gray-400">Aucun avis pour le moment.</p>}
          </div>
        </section>

        <aside className="rounded-2xl border border-white/10 bg-[#0a1128]/80 p-6">
          <h3 className="mb-4 text-xl font-bold">Donnez votre avis</h3>
          <ReviewForm filmId={id} />
        </aside>
      </div>
    </main>
  )
}