export function ReviewList({ reviews, onDelete }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-slate-600">Aucune review pour le moment.</p>
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="rounded border p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">
              {r.username} • {r.rating}/5
            </p>

            {onDelete && (
              <button
                onClick={() => onDelete(r.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Supprimer
              </button>
            )}
          </div>

          <p className="mt-2 text-slate-700">{r.comment}</p>

          {r.createdAt && (
            <p className="mt-2 text-xs text-slate-500">
              {new Date(r.createdAt).toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
