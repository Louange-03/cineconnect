import { getToken } from "../lib/auth"
import { buildApiUrl } from "../lib/apiUrl"

export async function publishReview(input: { filmId: string; rating: number; comment: string }) {
  const { filmId, rating, comment } = input
  const token = getToken()
  if (!token) throw new Error("Vous devez être connecté pour publier un avis.")

  const res = await fetch(buildApiUrl("/api/reviews"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ filmId, rating, comment }),
  })

  const contentType = res.headers.get("content-type") || ""
  const text = await res.text()
  const json = contentType.includes("application/json") && text ? JSON.parse(text) : null

  if (!res.ok) throw new Error(json?.message || text || "Erreur lors de la publication")
  return json as { action?: "updated" | "created" } | null
}
