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
    <span className="text-[11px] px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">
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
      <div className="mx-auto w-full max-w-6xl px-4 pt-12">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          Chargement du film...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pt-12">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {error.message}
        </div>
      </div>
    )
  }

  if (!film) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pt-12">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          Film introuvable.
        </div>
      </div>
    )
  }

  const poster =
    film.posterUrl ||
    "https://via.placeholder.com/900x1350/0b1020/ffffff?text=No+Image"

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10">
      {/* Back */}
      <div className="mb-6">
        <Link
          to="/films"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white"
        >
          <span className="text-lg">←</span> Retour au catalogue
        </Link>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="grid md:grid-cols-[320px_1fr] gap-0">
          {/* Poster */}
          <div className="relative">
            <div className="aspect-[2/3] md:aspect-auto md:h-full overflow-hidden">
              <img
                src={poster}
                alt={film.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent md:hidden" />
          </div>

          {/* Content */}
          <div className="relative p-6 md:p-10">
            <div className="absolute inset-0 -z-10 hidden md:block bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              {film.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-white/70">
              {film.year && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm">
                  {film.year}
                </span>
              )}
              {film.createdAt && (
                <span className="text-sm">Ajouté au catalogue</span>
              )}
            </div>

            {film.categories && film.categories.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {film.categories.map((c) => (
                  <Chip key={c}>{c}</Chip>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-2xl bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-6 py-3 font-semibold hover:brightness-110 transition"
              >
                Ajouter à ma liste
              </button>
              <button
                type="button"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white/85 hover:bg-white/10 transition"
              >
                Partager
              </button>
            </div>

            {/* Synopsis */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold">Synopsis</h2>
              <p className="mt-3 text-white/70 leading-relaxed">
                {film.synopsis || "Aucun synopsis disponible pour ce film."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-12 grid gap-8 md:grid-cols-[1fr_360px]">
        {/* List */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Avis</h2>
            {loadingReviews && <span className="text-white/60">Chargement…</span>}
          </div>

          <div className="mt-6 space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((r) => <ReviewCard key={r.id} review={r} />)
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/65">
                Aucun avis pour ce film.
              </div>
            )}
          </div>
        </section>

        {/* Form */}
        <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Donner votre avis</h3>
          <p className="mt-2 text-sm text-white/60">
            Notez le film et laissez un commentaire.
          </p>
          <div className="mt-6">
            <ReviewForm filmId={id} />
          </div>
        </aside>
      </div>
    </div>
  )
}