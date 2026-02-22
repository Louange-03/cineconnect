import React from "react"
import type { Review } from "../../types"
import type { MouseEventHandler } from "react"

interface Props {
  review: Review
  isMine?: boolean
  onEdit?: MouseEventHandler<HTMLButtonElement>
  onDelete?: MouseEventHandler<HTMLButtonElement>
}

export function ReviewCard({ review, isMine = false, onEdit, onDelete }: Props) {
  return (
    <div className="rounded border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{review.username || "Utilisateur"}</p>
          <p className="text-sm text-slate-600">
            Note : <span className="font-medium">{review.rating}/5</span>
          </p>
        </div>

        {isMine && (
          <div className="flex gap-2">
            <button
              className="rounded border px-3 py-2 text-sm hover:bg-slate-50"
              onClick={onEdit}
            >
              Modifier
            </button>
            <button
              className="rounded border px-3 py-2 text-sm hover:bg-slate-50"
              onClick={onDelete}
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      {review.comment ? (
        <p className="mt-2 text-sm">{review.comment}</p>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Aucun commentaire.</p>
      )}
    </div>
  )
}