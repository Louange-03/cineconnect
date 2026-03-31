import { getToken } from "../lib/auth"
import { buildApiUrl } from "../lib/apiUrl"
import type { Review } from "../types"

export async function fetchFilmById(id: string) {
  const res = await fetch(buildApiUrl(`/api/films/${id}`), {
    headers: { Accept: "application/json" },
  })
  const contentType = res.headers.get("content-type") || ""
  const text = await res.text()
  if (!res.ok) {
    if (contentType.includes("application/json")) {
      const json = JSON.parse(text || "{}")
      throw new Error(json?.message ?? "Film introuvable")
    }
    throw new Error("Film introuvable")
  }
  if (!contentType.includes("application/json")) throw new Error("Réponse invalide du serveur (pas du JSON)")
  return (JSON.parse(text) as { film?: any }).film ?? null
}

export async function ensureFilmImportedIfNeeded(filmId: string): Promise<string> {
  if (!/^tt\d+$/i.test(filmId)) return filmId
  const token = getToken()
  if (!token) return filmId
  const imported = await fetch(buildApiUrl("/api/films/import"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ imdbID: filmId }),
  })
  const contentType = imported.headers.get("content-type") || ""
  const text = await imported.text()
  const json = contentType.includes("application/json") && text ? JSON.parse(text) : null
  if (!imported.ok) throw new Error(json?.message || "Impossible d'importer le film")
  return String(json?.film?.id || filmId)
}

export async function toggleFavorite(filmId: string, next: boolean): Promise<void> {
  const token = getToken()
  if (!token) throw new Error("Connecte-toi pour gérer ta liste.")
  const res = await fetch(buildApiUrl(`/api/users/me/favorites/${filmId}`), {
    method: next ? "POST" : "DELETE",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  })
  const contentType = res.headers.get("content-type") || ""
  const text = await res.text()
  const json = contentType.includes("application/json") && text ? JSON.parse(text) : null
  if (!res.ok) throw new Error(json?.message || "Impossible de modifier la liste")
}

export async function getMyFavoritesIds(): Promise<string[]> {
  const token = getToken()
  if (!token) return []
  const res = await fetch(buildApiUrl("/api/users/me/favorites"), {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  const data = await res.json()
  const list = Array.isArray(data?.favorites) ? data.favorites : []
  return list.map((f: { id?: string }) => String(f?.id || ""))
}

export async function deleteReviewById(reviewId: string): Promise<void> {
  const token = getToken()
  if (!token) throw new Error("Connecte-toi pour gerer tes avis.")
  const res = await fetch(buildApiUrl(`/api/reviews/${reviewId}`), {
    method: "DELETE",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Suppression impossible")
}

export async function updateReview(review: Review, nextRating: number, nextComment: string): Promise<void> {
  const token = getToken()
  if (!token) throw new Error("Connecte-toi pour modifier ton avis.")
  const res = await fetch(buildApiUrl(`/api/reviews/${review.id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating: Math.round(nextRating), comment: nextComment }),
  })
  if (!res.ok) throw new Error("Modification impossible")
}
