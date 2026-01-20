export function StarRating({ value = 0, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1
        const active = starValue <= value
        return (
          <button
            key={starValue}
            type="button"
            className={`text-xl ${active ? "" : "opacity-30"} hover:opacity-100`}
            onClick={() => onChange?.(starValue)}
            aria-label={`Note ${starValue} sur 5`}
          >
            ★
          </button>
        )
      })}
      <span className="ml-2 text-sm text-slate-600">{value}/5</span>
    </div>
  )
}
