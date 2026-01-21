import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "@tanstack/react-router"
import { omdbGetById } from "../lib/omdb"
import { useAuth } from "../hooks/useAuth"

import { ReviewForm } from "../components/reviews/ReviewForm"
import { ReviewList } from "../components/reviews/ReviewList"
import { deleteReview, getReviewsByFilmId, upsertReview } from "../lib/reviews"

export function FilmDetail() {
  const { id } = useParams({ from: "/film/$id" })
  const { user, isAuth } = useAuth()

  const myUserId = user?.id || "u_local"
  const myUsername = user?.username || "Utilisateur"

  // Reviews (localStorage)
  const [reviews, setReviews] = useState([])
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    setReviews(getReviewsByFilmId(id))
    setEditing(null)
  }, [id])

  // Film data (OMDb)
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

  const year = data?.Year && data.Year !== "N/A" ? data.Year : null
  const runtime = data?.Runtime && data.Runtime !== "N/A" ? data.Runtime : null
  const genre = data?.Genre && data.Genre !== "N/A" ? data.Genre : null
  const imdbRating =
    data?.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : null

  // Ta review (si existe) — utile pour afficher "Modifier"
  const myReview = useMemo(() => {
    return reviews.find((r) => r.userId === myUserId) || null
  }, [reviews, myUserId])

  return (
    <div className="space-y-8">
      <Link to="/films" className="text-sm underline">
        ← Retour aux films
      </Link>

      {/* Film header */}
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <img
          src={poster}
          alt={data?.Title || "Film"}
          className="w-full rounded object-cover"
        />

        <div>
          <h1 className="text-2xl font-semibold">{data?.Title}</h1>

          <p className="mt-1 text-slate-600">
            {year ? year : ""}
            {runtime ? ` • ${runtime}` : ""}
            {genre ? ` • ${genre}` : ""}
          </p>

          {imdbRating && (
            <p className="mt-3">
              <span className="font-medium">Note IMDb :</span> {imdbRating}/10
            </p>
          )}

          <div className="mt-5 space-y-2">
            {data?.Director && data.Director !== "N/A" && (
              <p>
                <span className="font-medium">Réalisateur :</span>{" "}
                {data.Director}
              </p>
            )}

            {data?.Actors && data.Actors !== "N/A" && (
              <p>
                <span className="font-medium">Acteurs :</span> {data.Actors}
              </p>
            )}

            {data?.Plot && data.Plot !== "N/A" && (
              <p>
                <span className="font-medium">Synopsis :</span> {data.Plot}
              </p>
            )}

            {data?.Language && data.Language !== "N/A" && (
              <p>
                <span className="font-medium">Langue :</span> {data.Language}
              </p>
            )}

            {data?.Country && data.Country !== "N/A" && (
              <p>
                <span className="font-medium">Pays :</span> {data.Country}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Reviews & notation</h2>

          {isAuth && myReview && !editing && (
            <button
              type="button"
              className="rounded border px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => setEditing(myReview)}
            >
              Modifier ma review
            </button>
          )}
        </div>

        {!isAuth ? (
          <p className="text-slate-600">
            Connecte-toi pour publier une review.
          </p>
        ) : (
          <ReviewForm
            initial={editing || myReview}
            onSubmit={({ rating, comment }) => {
              upsertReview({
                filmId: id,
                userId: myUserId,
                username: myUsername,
                rating,
                comment,
              })
              setReviews(getReviewsByFilmId(id))
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        )}

        <ReviewList
          reviews={reviews}
          myUserId={myUserId}
          onEditMine={(r) => setEditing(r)}
          onDeleteMine={(r) => {
            deleteReview(r.id, myUserId)
            setReviews(getReviewsByFilmId(id))
            setEditing(null)
          }}
        />
      </section>
    </div>
  )
}
