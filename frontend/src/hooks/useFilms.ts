import { useQuery } from "@tanstack/react-query"
import type { OMDBMovie } from "../types"
import { omdbSearch } from "../lib/omdb"

export function useFilms(query: string) {
  return useQuery<OMDBMovie[], Error>({
    queryKey: ["films", query],
    queryFn: () => omdbSearch(query),
    enabled: !!query,
  })
}
