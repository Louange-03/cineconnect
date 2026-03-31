import React, { useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getUser } from "../lib/auth"
import { resolvePosterUrl } from "../lib/poster"
import type { Review } from "../types"
import {
  deleteReviewById,
  ensureFilmImportedIfNeeded,
  fetchFilmById,
  getMyFavoritesIds,
  toggleFavorite,
  updateReview,
} from "../services/filmDetail.service"

export function useFilmDetailPage(id: string) {
  const qc = useQueryClient()
  const [toast, setToast] = React.useState<string | null>(null)
  const [resolvedFilmId, setResolvedFilmId] = React.useState(id)
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [favoriteBusy, setFavoriteBusy] = React.useState(false)
  const currentUserId = getUser()?.id ?? null

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 1600)
  }

  const filmQuery = useQuery({
    queryKey: ["film", id],
    queryFn: async () => fetchFilmById(id),
    enabled: !!id,
  })
  const poster = useMemo(() => resolvePosterUrl(filmQuery.data), [filmQuery.data])

  const yearLabel =
    filmQuery.data?.year === null || filmQuery.data?.year === undefined || String(filmQuery.data?.year ?? "").trim() === ""
      ? null
      : String(filmQuery.data?.year)

  const onShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: filmQuery.data?.title ?? "Film", url })
        showToast("Partagé ✅")
      } else {
        await navigator.clipboard.writeText(url)
        showToast("Lien copié ✅")
      }
    } catch {
      // noop
    }
  }

  const onWatchlist = async () => {
    if (!resolvedFilmId || favoriteBusy) return
    const next = !isFavorite
    setFavoriteBusy(true)
    try {
      const targetFilmId = await ensureFilmImportedIfNeeded(resolvedFilmId)
      setResolvedFilmId(targetFilmId)
      await toggleFavorite(targetFilmId, next)
      setIsFavorite(next)
      if (typeof window !== "undefined") window.dispatchEvent(new Event("favorites-changed"))
      showToast(next ? "Ajouté à ma liste ✅" : "Retiré de ma liste ✅")
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erreur liste")
    } finally {
      setFavoriteBusy(false)
    }
  }

  const deleteMyReview = async (reviewId: string) => {
    try {
      await deleteReviewById(reviewId)
      await qc.invalidateQueries({ queryKey: ["reviews", resolvedFilmId] })
      showToast("Avis supprime ✅")
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erreur suppression avis")
    }
  }

  const editMyReview = async (review: Review) => {
    const nextRatingRaw = window.prompt("Nouvelle note (1 a 5)", String(review.rating ?? 0))
    if (nextRatingRaw === null) return
    const nextRating = Number(nextRatingRaw)
    if (!Number.isFinite(nextRating) || nextRating < 1 || nextRating > 5) {
      showToast("Note invalide (1 a 5).")
      return
    }
    const nextComment = window.prompt("Modifier votre commentaire", review.comment ?? "")
    if (nextComment === null) return
    try {
      await updateReview(review, nextRating, nextComment)
      await qc.invalidateQueries({ queryKey: ["reviews", resolvedFilmId] })
      showToast("Avis modifie ✅")
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erreur modification avis")
    }
  }

  React.useEffect(() => {
    setResolvedFilmId(id)
  }, [id])

  React.useEffect(() => {
    if (!/^tt\d+$/i.test(resolvedFilmId)) return
    void ensureFilmImportedIfNeeded(resolvedFilmId)
      .then((nextId) => setResolvedFilmId(nextId))
      .catch(() => {})
  }, [resolvedFilmId])

  React.useEffect(() => {
    let cancelled = false
    async function syncFavoriteState() {
      const ids = await getMyFavoritesIds()
      if (!cancelled) setIsFavorite(ids.includes(resolvedFilmId))
    }
    void syncFavoriteState()
    const refresh = () => void syncFavoriteState()
    window.addEventListener("favorites-changed", refresh)
    window.addEventListener("focus", refresh)
    return () => {
      cancelled = true
      window.removeEventListener("favorites-changed", refresh)
      window.removeEventListener("focus", refresh)
    }
  }, [resolvedFilmId])

  return {
    toast,
    resolvedFilmId,
    isFavorite,
    favoriteBusy,
    currentUserId,
    filmQuery,
    poster,
    yearLabel,
    onShare,
    onWatchlist,
    deleteMyReview,
    editMyReview,
  }
}
