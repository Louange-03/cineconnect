import { useQuery } from "@tanstack/react-query"
import type { Film } from "../types"

async function fetchFilms(query: string, category: string, year: string): Promise<Film[]> {
  const params = new URLSearchParams()
  if (query) params.append("q", query)
  if (category) params.append("category", category)
  if (year) params.append("year", year)

  // ✅ IMPORTANT: utilise une route API (évite conflit avec route frontend /films)
  const url = `/api/films?${params.toString()}`

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  })

  // 🔎 Récupérer un bout de texte pour diagnostiquer si c'est du HTML
  const contentType = res.headers.get("content-type") || ""
  const rawText = await res.text()

  if (!res.ok) {
    throw new Error(`Erreur lors du chargement des films (${res.status})`)
  }

  if (!contentType.includes("application/json")) {
    // typiquement: HTML renvoyé (index.html, page login, erreur serveur, etc.)
    const preview = rawText.slice(0, 160).replace(/\s+/g, " ")
    throw new Error(`Réponse API invalide (pas du JSON). Reçu: ${preview}`)
  }

  const data = JSON.parse(rawText)
  return data?.films ?? []
}

export function useFilms(query: string, category = "", year = "") {
  return useQuery<Film[], Error>({
    queryKey: ["films", query, category, year],
    queryFn: () => fetchFilms(query, category, year),
  })
}