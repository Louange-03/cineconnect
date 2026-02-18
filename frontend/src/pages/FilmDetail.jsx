import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "@tanstack/react-router"
import { omdbGetById } from "../lib/omdb"
import { useAuth } from "../hooks/useAuth"

import { ReviewForm } from "../components/reviews/ReviewForm"
import { ReviewList } from "../components/reviews/ReviewList"
import {
  addReview,
  deleteReview,
  getReviewsByFilmId,
} from "../lib/reviews"

export function FilmDetail() {
  const { id } = useParams({ from: "/film/$id" })
  const { user, isAuth } = useAuth()

  const [reviews, setReviews] = useState([])

  useEffect(() => {
    setReviews(getReviewsByFilmId(id))
  }, [id])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["omdb", "film", id],
    queryFn: () => omdbGetById(id),
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="surface p-6 text-sm text-[color:var(--muted)]">
        Chargement…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-3">
        <p className="surface border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Erreur : {error?.message || "Impossible de charger le film"}
        </p>
        <Link to="/films" className="btn btn-ghost w-fit">
          ← Retour aux films
        </Link>
      </div>
    )
  }

  const poster =
    data?.Poster && data.Poster !== "N/A"
      ? data.Poster
      : "https://via.placeholder.com/600x900?text=No+Poster"

  return (
    <div className="space-y-8">
      <Link to="/films" className="btn btn-ghost w-fit">
        ← Retour aux films
      </Link>

      <section className="surface overflow-hidden">
        <div className="grid gap-8 p-6 md:grid-cols-[320px_1fr] md:p-8">
          <div className="relative">
            <img
              src={poster}
              alt={data?.Title}
              className="w-full rounded-2xl border border-[color:var(--border)] object-cover shadow-sm"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="h-display text-3xl font-semibold leading-tight">
                {data?.Title}
              </h1>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                {data?.Year} • {data?.Genre} • {data?.Runtime}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {data?.imdbRating && data.imdbRating !== "N/A" && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-solid)] px-3 py-1 text-sm">
                  <span className="font-semibold">IMDb</span>
                  <span className="text-[color:var(--muted)]">
                    {data.imdbRating}/10
                  </span>
                </span>
              )}
              {data?.Rated && data.Rated !== "N/A" && (
                <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-solid)] px-3 py-1 text-sm text-[color:var(--muted)]">
                  {data.Rated}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-[color:var(--muted)]">
                Synopsis
              </p>
              <p className="text-[color:var(--text)]">{data?.Plot}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-solid)] p-4">
                <p className="text-xs font-semibold text-[color:var(--muted)]">
                  Acteurs
                </p>
                <p className="mt-1 text-sm">{data?.Actors}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-solid)] p-4">
                <p className="text-xs font-semibold text-[color:var(--muted)]">
                  Réalisateur
                </p>
                <p className="mt-1 text-sm">{data?.Director}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="#reviews" className="btn btn-primary">
                Noter / Commenter
              </a>
              <Link to="/films" className="btn btn-ghost">
                Continuer à explorer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="h-display text-2xl font-semibold">Reviews</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Donne ton avis et découvre celui des autres.
            </p>
          </div>
        </div>

        {!isAuth ? (
          <div className="surface p-6">
            <p className="text-sm text-[color:var(--muted)]">
              Connecte-toi pour publier une review.
            </p>
            <div className="mt-4 flex gap-3">
              <Link to="/login" className="btn btn-primary">
                Se connecter
              </Link>
              <Link to="/register" className="btn btn-ghost">
                Créer un compte
              </Link>
            </div>
          </div>
        ) : (
          <div className="surface p-6">
            <ReviewForm
              onSubmit={({ rating, comment }) => {
                const newReview = {
                  id: crypto.randomUUID(),
                  filmId: id,
                  userId: user.id,
                  username: user.username,
                  rating,
                  comment,
                  createdAt: new Date().toISOString(),
                }

                setReviews(addReview(id, newReview))
              }}
            />
          </div>
        )}

        <div className="surface p-6">
          <ReviewList
            reviews={reviews}
            onDelete={
              isAuth
                ? (reviewId) => setReviews(deleteReview(id, reviewId))
                : null
            }
          />
        </div>
      </section>
    </div>
  )
}
