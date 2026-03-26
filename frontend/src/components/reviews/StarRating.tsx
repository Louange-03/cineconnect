import React from "react"
import type { MouseEventHandler } from "react"

interface Props {
  value?: number
  onChange?: (v: number) => void
  readonly?: boolean
}

export function StarRating({ value = 0, onChange, readonly = false }: Props) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`text-xl ${
            star <= value ? "text-yellow-500" : "text-slate-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}