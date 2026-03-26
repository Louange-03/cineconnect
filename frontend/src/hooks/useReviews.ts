import { useQuery } from "@tanstack/react-query"
import type { Review } from "../types"

async function fetchReviews(filmId: string): Promise<Review[]> {
  const res = await fetch(`/api/reviews/film/${filmId}`, {
    headers: { Accept: "application/json" },
  })

  if (!res.ok) throw new Error("Erreur lors du chargement des avis")

  const contentType = res.headers.get("content-type") || ""
  const text = await res.text()
  if (!contentType.includes("application/json")) {
    throw new Error("Réponse invalide du serveur (pas du JSON)")
  }

  const data = JSON.parse(text)
  return data.reviews ?? []
}

export function useReviews(filmId: string) {
  return useQuery<Review[], Error>({
    queryKey: ["reviews", filmId],
    queryFn: () => fetchReviews(filmId),
    enabled: !!filmId,
  })
}