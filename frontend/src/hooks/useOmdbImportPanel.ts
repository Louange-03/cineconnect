import { useEffect, useMemo, useState } from "react"
import { useDebounce } from "./useDebounce"
import { useImportOmdbFilm, useOmdbSearch } from "./useOmdb"
import { limitOmdbResults } from "../utils/omdb"

export function useOmdbImportPanel(initialQuery?: string) {
  const [q, setQ] = useState(initialQuery || "")
  const debouncedQ = useDebounce(q, 350)
  const importMutation = useImportOmdbFilm()

  useEffect(() => {
    if (!initialQuery) return
    setQ(initialQuery)
  }, [initialQuery])

  const canSearch = useMemo(() => debouncedQ.trim().length >= 3, [debouncedQ])
  const search = useOmdbSearch(canSearch ? debouncedQ : "")
  const list = useMemo(() => limitOmdbResults(search.data), [search.data])

  return {
    q,
    setQ,
    debouncedQ,
    canSearch,
    list,
    data: search.data ?? [],
    isLoading: search.isLoading,
    importMutation,
  }
}
