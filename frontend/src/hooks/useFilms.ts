import { useQuery } from "@tanstack/react-query"
import type { Film } from "../types"

function getFilmsCacheKey(query: string, category: string, year: string) {
  return `films_cache_${query || "all"}_${category || "all"}_${year || "all"}`
}

async function fetchFilms(query: string, category: string, year: string): Promise<Film[]> {
  const cacheKey = getFilmsCacheKey(query, category, year)
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {
      localStorage.removeItem(cacheKey)
    }
  }

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
  const films = Array.isArray(data.films) ? data.films : []
  if (films.length > 0) {
    localStorage.setItem(cacheKey, JSON.stringify(films))
  }
  return films
}

// Purge automatique du cache si la structure a changé
const CACHE_VERSION = 'v2';
if (localStorage.getItem('films_cache_version') !== CACHE_VERSION) {
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith('films_cache_')) localStorage.removeItem(k);
  });
  localStorage.setItem('films_cache_version', CACHE_VERSION);
}

export function useFilms(query: string, category = "", year = "") {
  return useQuery<Film[], Error>({
    queryKey: ["films", query, category, year],
    queryFn: () => fetchFilms(query, category, year),
  })
}