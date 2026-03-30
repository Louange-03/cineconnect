import { useQuery } from "@tanstack/react-query"
import { buildApiUrl } from "../lib/apiUrl"
import { FILMS_PAGE_LIMIT } from "./useFilms"
import type { Film } from "../types"

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
  return data.films || []
}

export function useFilms(query: string, category = "", year = "") {
  return useQuery<Film[], Error>({
    queryKey: ["films", query, category, year, FILMS_PAGE_LIMIT],
    queryFn: () => fetchFilms(query, category, year),
  })
}
