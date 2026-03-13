import React from "react"
import type { Review } from "../../types"
import type { MouseEventHandler } from "react"

interface Props {
  review: Review
  isMine?: boolean
  onEdit?: MouseEventHandler<HTMLButtonElement>
  onDelete?: MouseEventHandler<HTMLButtonElement>
}

function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, Math.round(value)))
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < v ? "text-yellow-300" : "text-white/20"}
          aria-hidden
        >
          ★
        </span>
      ))}
      <span className="ml-2 text-sm text-white/60">{v}/5</span>
    </div>
  )
}

function formatDate(iso?: string) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" })
}

export function ReviewCard({ review, isMine = false, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">
            {review.username || "Utilisateur"}
          </p>
          <div className="mt-2">
            <Stars value={review.rating} />
          </div>
          {review.createdAt && (
            <p className="mt-2 text-xs text-white/50">
              {formatDate(review.createdAt)}
            </p>
          )}
        </div>

        {isMine && (
          <div className="flex gap-2">
            <button
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              onClick={onEdit}
              type="button"
            >
              Modifier
            </button>
            <button
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 hover:bg-red-500/15 transition"
              onClick={onDelete}
              type="button"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-white/75 leading-relaxed">
        {review.comment ? (
          <p>{review.comment}</p>
        ) : (
          <p className="text-white/50">Aucun commentaire.</p>
        )}
      </div>
    </div>
  )
}