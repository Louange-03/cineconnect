import React, { FormEvent } from "react"
import { StarRating } from "./StarRating"
import { useReviewForm } from "../../hooks/useReviewForm"

interface Props {
  filmId: string
}

export function ReviewForm({ filmId }: Props) {
  const { rating, setRating, comment, setComment, isSubmitting, error, success, submit: submitReview } =
    useReviewForm(filmId)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await submitReview()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold text-white">Laisser un avis</h3>
        <p className="mt-1 text-sm text-white/60">
          Votre note aide la communauté.
        </p>

        <div className="mt-4">
          <StarRating value={rating} onChange={setRating} />
        </div>

        <textarea
          rows={4}
          className="mt-4 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#1D6CE0]/70"
          placeholder="Votre avis…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {error && (
          <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-6 py-3 font-semibold text-white hover:brightness-110 transition disabled:opacity-60"
        >
          {isSubmitting ? "Publication…" : "Publier"}
        </button>
      </div>
    </form>
  )
}