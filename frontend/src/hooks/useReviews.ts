import { useQuery } from "@tanstack/react-query"
import type { Review } from "../types"

async function fetchReviews(filmId: string): Promise<Review[]> {
  const res = await fetch(`/reviews?filmId=${filmId}`)
  if (!res.ok) throw new Error("Erreur lors du chargement des reviews")
  const data = await res.json()
  return data.reviews || []
}

export function useReviews(filmId: string) {
  return useQuery<Review[], Error>({
    queryKey: ["reviews", filmId],
    queryFn: () => fetchReviews(filmId),
    enabled: !!filmId,
  })
}
