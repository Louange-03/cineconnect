import { useEffect, useState } from "react"
import { useDebounce } from "./useDebounce"

type UseSearchBarStateOptions = {
  value: string
  onChange: (value: string) => void
  debounceMs?: number
}

export function useSearchBarState({ value, onChange, debounceMs = 350 }: UseSearchBarStateOptions) {
  const [input, setInput] = useState(value)
  const debouncedInput = useDebounce(input, debounceMs)

  useEffect(() => {
    setInput(value)
  }, [value])

  useEffect(() => {
    if (debouncedInput !== value) onChange(debouncedInput)
  }, [debouncedInput, onChange, value])

  return { input, setInput }
}
