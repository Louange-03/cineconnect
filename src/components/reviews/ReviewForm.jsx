import { useState } from "react"
import { StarRating } from "./StarRating"

export function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [error, setError] = useState(null)

  return (
    <form
      className="space-y-3 rounded border p-4"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)

        if (rating === 0) return setError("Choisis une note (1 à 5).")
        if (comment.trim().length < 3) return setError("Écris un commentaire (min. 3 caractères).")

        onSubmit?.({ rating, comment: comment.trim() })
        setRating(0)
        setComment("")
      }}
    >
      <div>
        <p className="text-sm font-medium">Ta note</p>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="text-sm font-medium">Commentaire</label>
        <textarea
          className="mt-1 w-full rounded border p-2"
          rows={3}
          placeholder="Qu’est-ce que tu as pensé du film ?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="rounded bg-black px-3 py-2 text-white">
        Publier
      </button>
    </form>
  )
}
