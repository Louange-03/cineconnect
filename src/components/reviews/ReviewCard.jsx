export function ReviewCard({ review, onDelete }) {
  return (
    <div className="rounded border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">
            {review.username}{" "}
            <span className="text-sm text-slate-600">• {review.rating}/5</span>
          </p>
          <p className="mt-2">{review.comment}</p>
          <p className="mt-2 text-xs text-slate-500">
            {new Date(review.createdAt).toLocaleString()}
          </p>
        </div>

        {onDelete && (
          <button
            className="rounded border px-2 py-1 text-sm hover:bg-slate-50"
            onClick={() => onDelete(review.id)}
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  )
}
