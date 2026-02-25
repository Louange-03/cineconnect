import React, { useState, useEffect } from "react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [input, setInput] = useState(value)

  // debounce recherche
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (input !== value) onChange(input)
    }, 400)
    return () => clearTimeout(timeout)
  }, [input])

  useEffect(() => {
    setInput(value)
  }, [value])

  return (
    <div className="relative w-full">
      {/* icon */}
      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/40">
        🔍
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder || "Rechercher un film..."}
        className="w-full h-[52px] rounded-2xl border border-white/15 bg-white/5 pl-12 pr-4 text-white placeholder:text-white/40 outline-none transition focus:border-[#3ca3f5]/70 focus:bg-white/10 shadow-md"
      />
    </div>
  )
}