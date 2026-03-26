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
  const author = review.username || "Utilisateur"
  const initial = author.charAt(0).toUpperCase()

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1D6CE0]/25 text-sm font-bold text-[#8cc6ff]">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white">{author}</p>
              {isMine ? (
                <span className="rounded-full border border-[#3EA6FF]/30 bg-[#1D6CE0]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8cc6ff]">
                  Vous
                </span>
              ) : null}
            </div>
            <div className="mt-1">
              <Stars value={review.rating} />
            </div>
            {review.createdAt && (
              <p className="mt-1 text-xs text-white/50">{formatDate(review.createdAt)}</p>
            )}
          </div>
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

      <div className="mt-4 text-white/80 leading-relaxed">
        {review.comment ? (
          <p>{review.comment}</p>
        ) : (
          <p className="text-white/50">Aucun commentaire.</p>
        )}
      </div>
    </div>
  )
}