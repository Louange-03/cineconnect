import { useState } from "react"

export function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  return (
    <form
      className="space-y-3 rounded border p-4"
      onSubmit={(e) => {
        e.preventDefault()
        const c = comment.trim()
        if (!c) return
        onSubmit({ rating, comment: c })
        setComment("")
        setRating(5)
      }}
    >
      <div>
        <label className="block text-sm font-medium">Note (0 à 5)</label>
        <input
          type="number"
          min={0}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 w-24 rounded border px-2 py-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Commentaire</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Écris ton avis…"
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90"
      >
        Publier
      </button>
    </form>
  )
}
