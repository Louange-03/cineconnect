import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "@tanstack/react-router"
import { omdbGetById } from "../lib/omdb"
import { useAuth } from "../hooks/useAuth"
import { Review } from "../types"

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

  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    setReviews(getReviewsByFilmId(id))
  }, [id])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["omdb", "film", id],
    queryFn: () => omdbGetById(id),
    staleTime: 60_000,
  })

  if (isLoading) return <p className="text-slate-600">Chargement…</p>

  if (isError) {
    return (
      <div className="space-y-3">
        <p className="text-red-600">
          Erreur : {error?.message || "Impossible de charger le film"}
        </p>
        <Link to="/films" className="underline">
          Retour aux films
        </Link>
      </div>
    )
  }

  const poster =
    data?.Poster && data.Poster !== "N/A"
      ? data.Poster
      : "https://via.placeholder.com/300x450?text=No+Poster"

  return (
    <div className="space-y-8">
      <Link to="/films" className="text-sm underline">
        ← Retour aux films
      </Link>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <img src={poster} alt={data?.Title} className="rounded" />

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{data?.Title}</h1>
          <p className="text-slate-600">
            {data?.Year} • {data?.Genre}
          </p>
          <p>{data?.Plot}</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Reviews & notation</h2>

        {!isAuth ? (
          <p className="text-slate-600">
            Connecte-toi pour publier une review.
          </p>
        ) : (
          <ReviewForm
            onSubmit={({ rating, comment }) => {
              if (!user) return
              
              const newReview: Review = {
                id: crypto.randomUUID(),
                userId: user.id,
                username: user.username,
                rating,
                comment,
                createdAt: new Date().toISOString(),
              }

              setReviews(addReview(id, newReview))
            }}
          />
        )}

        <ReviewList
          reviews={reviews}
          onDelete={
            isAuth
              ? (reviewId) => setReviews(deleteReview(id, reviewId))
              : undefined
          }
        />
      </section>
    </div>
  )
}
