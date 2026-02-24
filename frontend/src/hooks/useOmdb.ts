import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getToken } from "../lib/auth"
import type { OMDBMovie } from "../types"

type OmdbSearchResponse = {
  Search?: OMDBMovie[]
  Response?: string
  Error?: string
}

export function useOmdbSearch(query: string) {
  return useQuery<OMDBMovie[], Error>({
    queryKey: ["omdb-search", query],
    enabled: query.trim().length >= 3,
    queryFn: async () => {
      const res = await fetch(`/api/films/tmdb?q=${encodeURIComponent(query)}`, {
        headers: { Accept: "application/json" },
      })
      if (!res.ok) throw new Error("Erreur recherche OMDb")

      const data = (await res.json()) as OmdbSearchResponse
      if (data?.Response === "False") return []
      return data?.Search ?? []
    },
  })
}

export function useImportOmdbFilm() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (imdbID: string) => {
      const token = getToken()
      if (!token) throw new Error("Connecte-toi pour importer un film.")

      const res = await fetch("/api/films/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imdbID }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Erreur import film")
      }

      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["films"] })
      qc.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}