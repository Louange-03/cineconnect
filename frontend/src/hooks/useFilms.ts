import { useQuery } from "@tanstack/react-query"
import { buildApiUrl } from "../lib/apiUrl"
import type { Film } from "../types"

/** Aligné sur DEFAULT_FILMS_LIMIT côté API (catalogues larges + TMDB). */
export const FILMS_PAGE_LIMIT = "10000"

async function fetchFilms(query: string, category: string, year: string): Promise<Film[]> {
  const params = new URLSearchParams()
  params.set("limit", FILMS_PAGE_LIMIT)
  if (query) params.append("q", query)
  if (category) params.append("category", category)
  if (year) params.append("year", year)

  const res = await fetch(buildApiUrl(`/api/films?${params.toString()}`), {
    headers: { Accept: "application/json" },
  })

  if (!res.ok) throw new Error("Erreur lors du chargement des films")

  const contentType = res.headers.get("content-type") || ""
  const text = await res.text()
  if (!contentType.includes("application/json")) {
    throw new Error("Réponse invalide du serveur (pas du JSON)")
  }

  const data = JSON.parse(text)
  const films = Array.isArray(data.films) ? data.films : []
  return films
}

export function useFilms(query: string, category = "", year = "") {
  return useQuery<Film[], Error>({
    queryKey: ["films", query, category, year, FILMS_PAGE_LIMIT],
    queryFn: () => fetchFilms(query, category, year),
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  })
}