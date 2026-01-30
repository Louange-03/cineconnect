import { StarRating } from "./StarRating"

export function ReviewList({ reviews, onDelete }) {
  if (reviews.length === 0) {
    return <p className="text-slate-600">Aucune review.</p>
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded border p-3">
          <div className="flex items-center justify-between">
            <p className="font-medium">{r.username}</p>

            {onDelete && (
              <button
                className="text-sm text-red-600"
                onClick={() => onDelete(r.id)}
              >
                Supprimer
              </button>
            )}
          </div>

          <StarRating value={r.rating} readonly />

          {r.comment && (
            <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}
