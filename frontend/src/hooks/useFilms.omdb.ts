import { useQuery } from "@tanstack/react-query"
import type { Film, OMDBMovie } from "../types"

async function fetchFilms(query: string, category: string, year: string): Promise<Film[]> {
  const params = new URLSearchParams()
  if (query) params.append("q", query)
  if (category) params.append("category", category)
  if (year) params.append("year", year)

  // 1. Essayer la base locale
  const res = await fetch(`/api/films?${params.toString()}`, {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) throw new Error("Erreur lors du chargement des films")
  const contentType = res.headers.get("content-type") || ""
  const text = await res.text()
  if (!contentType.includes("application/json")) {
    throw new Error("Réponse invalide du serveur (pas du JSON)")
  }
  const data = JSON.parse(text)
  if (data.films && data.films.length > 0) return data.films

  // 2. Si aucun film local, fallback OMDb
  if (query) {
    const omdbRes = await fetch(`/api/films/tmdb?q=${encodeURIComponent(query)}`)
    const omdbData = await omdbRes.json()
    if (omdbData.Search && Array.isArray(omdbData.Search)) {
      // Adapter le format OMDb au format Film minimal
      return omdbData.Search.map((m: OMDBMovie) => ({
        id: m.imdbID,
        title: m.Title,
        year: m.Year,
        posterUrl: m.Poster !== "N/A" ? m.Poster : undefined,
        synopsis: undefined,
        metadata: undefined,
        categories: [],
      }))
    }
  }
  return []
}

export function useFilms(query: string, category = "", year = "") {
  return useQuery<Film[], Error>({
    queryKey: ["films", query, category, year],
    queryFn: () => fetchFilms(query, category, year),
  })
}
