import React, { useState } from "react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [input, setInput] = useState(value)

  // Debounce: attend 400ms après la dernière frappe avant de déclencher onChange
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (input !== value) onChange(input)
    }, 400)
    return () => clearTimeout(timeout)
  }, [input])

  React.useEffect(() => {
    setInput(value)
  }, [value])

  return (
    <input
      className="w-full rounded border px-3 py-2"
      type="text"
      value={input}
      onChange={e => setInput(e.target.value)}
      placeholder={placeholder || "Rechercher..."}
    />
  )
}
