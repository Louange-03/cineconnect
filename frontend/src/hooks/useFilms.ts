import { useQuery } from "@tanstack/react-query"
import { buildApiUrl } from "../lib/apiUrl"
import type { Film } from "../types"

/** Aligné sur DEFAULT_FILMS_LIMIT côté API (catalogues larges + TMDB). */
export const FILMS_PAGE_LIMIT = "1200"
export const HOME_FILMS_LIMIT = "240"

async function fetchFilms(query: string, category: string, year: string, limit: string): Promise<Film[]> {
  const params = new URLSearchParams()
  params.set("limit", limit)
  if (query) params.append("q", query)
  if (category) params.append("category", category)
  if (year) params.append("year", year)

  const res = await fetch(buildApiUrl(`/api/films?${params.toString()}`), {
    headers: { Accept: "application/json" },
  })

  if (!res.ok) throw new Error("Erreur lors du chargement des films")

  const text = await res.text()
  let data: { films?: Film[] }
  try {
    data = text ? (JSON.parse(text) as { films?: Film[] }) : {}
  } catch {
    throw new Error("Réponse invalide du serveur (pas du JSON)")
  }
  const films = Array.isArray(data.films) ? data.films : []
  return films
}

export function useFilms(query: string, category = "", year = "", limit = FILMS_PAGE_LIMIT) {
  return useQuery<Film[], Error>({
    queryKey: ["films", query, category, year, limit],
    queryFn: () => fetchFilms(query, category, year, limit),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}