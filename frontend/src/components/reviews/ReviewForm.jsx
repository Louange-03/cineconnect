import { useState } from "react"
import { StarRating } from "./StarRating"

export function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")

  function submit(e) {
    e.preventDefault()
    if (rating === 0) return

    onSubmit({ rating, comment })
    setRating(0)
    setComment("")
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded border p-4">
      <h3 className="font-medium">Laisser une review</h3>

      <StarRating value={rating} onChange={setRating} />

      <textarea
        rows={3}
        className="w-full rounded border px-3 py-2"
        placeholder="Ton avis…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button className="rounded bg-black px-4 py-2 text-white">
        Publier
      </button>
    </form>
  )
}
