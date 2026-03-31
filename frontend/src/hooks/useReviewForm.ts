import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { publishReview } from "../services/review.service"

export function useReviewForm(filmId: string) {
  const qc = useQueryClient()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function submit() {
    setError(null)
    setSuccess(null)
    if (!filmId) return
    if (rating === 0) {
      setError("Veuillez sélectionner une note.")
      return
    }

    try {
      setIsSubmitting(true)
      const result = await publishReview({ filmId, rating, comment })
      setRating(0)
      setComment("")
      await qc.invalidateQueries({ queryKey: ["reviews", filmId] })
      setSuccess(result?.action === "updated" ? "Avis mis à jour ✅" : "Avis publié ✅")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur"
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    rating,
    setRating,
    comment,
    setComment,
    isSubmitting,
    error,
    success,
    submit,
  }
}
