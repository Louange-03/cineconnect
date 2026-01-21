export function StarRating({ value = 0, onChange, size = 26 }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => {
        const active = n <= value
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            className="leading-none"
            aria-label={`Noter ${n} sur 5`}
            style={{ fontSize: size }}
          >
            <span className={active ? "text-yellow-500" : "text-slate-300"}>★</span>
          </button>
        )
      })}
    </div>
  )
}
