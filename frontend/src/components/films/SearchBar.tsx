import React from "react"
import { CompactSearchInput } from "../ui/CompactSearchInput"
import { useSearchBarState } from "../../hooks/useSearchBarState"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  onSubmit?: (value: string) => void
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher un film, une série, un acteur…",
  debounceMs = 350,
  onSubmit,
}: SearchBarProps) {
  const { input, setInput } = useSearchBarState({ value, onChange, debounceMs })

  return (
    <form
      className="w-full max-w-xl"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(input.trim())
      }}
    >
      <CompactSearchInput
        inputType="search"
        value={input}
        onChange={setInput}
        placeholder={placeholder}
      />
    </form>
  )
}
