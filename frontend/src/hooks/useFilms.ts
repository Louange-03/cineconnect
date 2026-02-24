import { useQuery } from "@tanstack/react-query"
import type { Film } from "../types"

async function fetchFilms(query: string, category: string, year: string): Promise<Film[]> {
  const params = new URLSearchParams()
  if (query) params.append("q", query)
  if (category) params.append("category", category)
  if (year) params.append("year", year)

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
  return data.films ?? []
}

export function useFilms(query: string, category = "", year = "") {
  return useQuery<Film[], Error>({
    queryKey: ["films", query, category, year],
    queryFn: () => fetchFilms(query, category, year),
  })
}