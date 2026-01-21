import { useEffect, useState } from "react"
import { StarRating } from "./StarRating"

export function ReviewForm({ initial, onSubmit, onCancel }) {
  const [rating, setRating] = useState(initial?.rating || 0)
  const [comment, setComment] = useState(initial?.comment || "")

  useEffect(() => {
    setRating(initial?.rating || 0)
    setComment(initial?.comment || "")
  }, [initial])

  return (
    <form
      className="space-y-3 rounded border p-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.({ rating, comment })
      }}
    >
      <div>
        <p className="text-sm font-medium">Ta note</p>
        <StarRating value={rating} onChange={setRating} />
        {rating === 0 && <p className="mt-1 text-xs text-slate-500">Choisis une note (1 à 5).</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Commentaire</label>
        <textarea
          className="mt-1 w-full rounded border px-3 py-2"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ton avis…"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
          disabled={rating === 0}
        >
          Enregistrer
        </button>
        {onCancel && (
          <button type="button" className="rounded border px-3 py-2 text-sm hover:bg-slate-50" onClick={onCancel}>
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
