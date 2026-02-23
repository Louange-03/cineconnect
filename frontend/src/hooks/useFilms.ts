
import { useQuery } from "@tanstack/react-query"
import type { Film } from "../types"

async function fetchFilms(query: string, category: string, year: string): Promise<Film[]> {
  const params = new URLSearchParams()
  if (query) params.append("q", query)
  if (category) params.append("category", category)
  if (year) params.append("year", year)
  const res = await fetch(`/films?${params.toString()}`)
  if (!res.ok) throw new Error("Erreur lors du chargement des films")
  const data = await res.json()
  return data.films || []
}

export function useFilms(query: string, category = "", year = "") {
  return useQuery<Film[], Error>({
    queryKey: ["films", query, category, year],
    queryFn: () => fetchFilms(query, category, year),
  })
}
