import React, { useEffect, useMemo, useState } from "react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  debounceMs = 350,
}: SearchBarProps) {
  const [input, setInput] = useState(value)

  useEffect(() => {
    setInput(value)
  }, [value])

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (input !== value) onChange(input)
    }, debounceMs)

    return () => window.clearTimeout(t)
  }, [input, value, onChange, debounceMs])

  const hasValue = useMemo(() => input.trim().length > 0, [input])

  return (
    <div className="relative w-full">
      {/* Search icon */}
      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/40">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder || "Rechercher un film..."}
        className="h-[54px] w-full rounded-2xl border border-white/15 bg-white/5 pl-12 pr-12 text-white placeholder:text-white/40 shadow-md outline-none transition focus:border-[#3EA6FF]/70 focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#3EA6FF]/40"
      />

      {/* Clear button */}
      {hasValue && (
        <button
          type="button"
          onClick={() => setInput("")}
          className="absolute inset-y-0 right-3 flex items-center justify-center rounded-full px-2 text-white/50 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          aria-label="Effacer la recherche"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}