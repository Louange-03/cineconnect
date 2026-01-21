import { ReviewCard } from "./ReviewCard"

export function ReviewList({ reviews, myUserId, onEditMine, onDeleteMine }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-slate-600">Aucun avis pour ce film.</p>
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <ReviewCard
          key={r.id}
          review={r}
          isMine={r.userId === myUserId}
          onEdit={() => onEditMine?.(r)}
          onDelete={() => onDeleteMine?.(r)}
        />
      ))}
    </div>
  )
}
