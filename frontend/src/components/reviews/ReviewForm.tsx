import React, { useState, FormEvent, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { StarRating } from "./StarRating"
import { getToken } from "../../lib/auth"

type ReviewFormProps = {
  filmId: string
  // Mode édition — si fourni, le formulaire modifie l'avis existant
  editReviewId?: string
  editInitialRating?: number
  editInitialComment?: string
  onEditDone?: () => void
}

export function ReviewForm({
  filmId,
  editReviewId,
  editInitialRating = 0,
  editInitialComment = "",
  onEditDone,
}: ReviewFormProps) {
  const qc = useQueryClient()
  const [rating, setRating] = useState(editInitialRating)
  const [comment, setComment] = useState(editInitialComment)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditMode = Boolean(editReviewId)

  // Sync si les props changent (ex: on ouvre l'édition d'un autre avis)
  useEffect(() => {
    setRating(editInitialRating)
    setComment(editInitialComment)
  }, [editReviewId, editInitialRating, editInitialComment])

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)

    if (rating === 0) {
      setError("Veuillez sélectionner une note.")
      return
    }

    const token = getToken()
    if (!token) {
      setError("Vous devez être connecté pour publier un avis.")
      return
    }

    try {
      setIsSubmitting(true)

      const url = isEditMode
        ? `http://localhost:3001/api/reviews/${editReviewId}`
        : "http://localhost:3001/api/reviews"

      const method = isEditMode ? "PUT" : "POST"

      const body = isEditMode
        ? JSON.stringify({ rating, comment })
        : JSON.stringify({ filmId, rating, comment })

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Erreur lors de la publication")
      }

      setRating(0)
      setComment("")

      await qc.invalidateQueries({ queryKey: ["reviews", filmId] })

      if (isEditMode && onEditDone) onEditDone()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur"
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        {!isEditMode && (
          <>
            <h3 className="text-lg font-semibold text-white">Laisser un avis</h3>
            <p className="mt-1 text-sm text-white/60">Votre note aide la communauté.</p>
          </>
        )}

        <div className={isEditMode ? "" : "mt-4"}>
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

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#1D6CE0] to-[#3EA6FF] px-6 py-3 font-semibold text-white hover:brightness-110 transition disabled:opacity-60"
          >
            {isSubmitting
              ? "Enregistrement…"
              : isEditMode
              ? "Enregistrer"
              : "Publier"}
          </button>

          {isEditMode && onEditDone && (
            <button
              type="button"
              onClick={onEditDone}
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white/80 hover:bg-white/10 transition"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </form>
  )
}