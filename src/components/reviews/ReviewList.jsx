import { ReviewCard } from "./ReviewCard"

export function ReviewList({ reviews, onDelete }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-slate-600">Aucune review pour le moment.</p>
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} onDelete={onDelete} />
      ))}
    </div>
  )
}
