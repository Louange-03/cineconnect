import React, { useState, FormEvent } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { StarRating } from "./StarRating"
import { getToken } from "../../lib/auth"

interface Props {
  filmId: string
}

export function ReviewForm({ filmId }: Props) {
  const qc = useQueryClient()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!filmId) return
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

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filmId, rating, comment }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Erreur lors de la publication")
      }

      // reset
      setRating(0)
      setComment("")

      // refresh reviews list
      await qc.invalidateQueries({ queryKey: ["reviews", filmId] })
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