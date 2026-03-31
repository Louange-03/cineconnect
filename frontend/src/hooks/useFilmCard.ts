import { useEffect, useMemo, useState } from "react"
import type { Film } from "../types"
import type { ShareFriend } from "../services/film.service"
import { fetchShareFriends, shareFilmToFriend, toggleFavoriteFilm } from "../services/film.service"
import { resolvePosterUrl } from "../lib/poster"

type UseFilmCardOptions = {
  film: Film
  initialIsFavorite?: boolean
  onFavoriteChange?: (filmId: string, isFavorite: boolean) => void
}

export function useFilmCard({ film, initialIsFavorite = false, onFavoriteChange }: UseFilmCardOptions) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [friends, setFriends] = useState<ShareFriend[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [sharingTo, setSharingTo] = useState<string | null>(null)
  const [friendSearch, setFriendSearch] = useState("")

  useEffect(() => {
    setIsFavorite(initialIsFavorite)
  }, [initialIsFavorite])

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 1600)
  }

  const filteredFriends = useMemo(
    () => friends.filter((f) => f.username.toLowerCase().includes(friendSearch.trim().toLowerCase())),
    [friendSearch, friends],
  )

  const poster = resolvePosterUrl(film)
  const categories = film.categories?.slice(0, 2) ?? []
  const yearLabel =
    film.year === null || film.year === undefined || String(film.year).trim() === "" ? "—" : String(film.year)

  async function handleFavoriteClick() {
    if (busy) return
    const next = !isFavorite
    setBusy(true)
    setIsFavorite(next)
    onFavoriteChange?.(film.id, next)
    try {
      await toggleFavoriteFilm(film.id, next)
      if (typeof window !== "undefined") window.dispatchEvent(new Event("favorites-changed"))
      showToast(next ? "Ajouté aux favoris ✅" : "Retiré des favoris ✅")
    } catch {
      setIsFavorite(!next)
      onFavoriteChange?.(film.id, !next)
      showToast("Erreur favoris. Réessaie.")
    } finally {
      setBusy(false)
    }
  }

  async function openShare() {
    setShareOpen(true)
    setFriendSearch("")
    setLoadingFriends(true)
    try {
      setFriends(await fetchShareFriends())
    } catch {
      showToast("Impossible de charger tes amis.")
      setShareOpen(false)
    } finally {
      setLoadingFriends(false)
    }
  }

  async function shareToFriend(friend: ShareFriend) {
    setSharingTo(friend.id)
    try {
      await shareFilmToFriend(film, friend)
      setShareOpen(false)
      showToast(`Partagé avec ${friend.username} ✅`)
    } catch {
      showToast("Echec du partage.")
    } finally {
      setSharingTo(null)
    }
  }

  return {
    isFavorite,
    busy,
    toast,
    shareOpen,
    setShareOpen,
    loadingFriends,
    sharingTo,
    friendSearch,
    setFriendSearch,
    filteredFriends,
    handleFavoriteClick,
    openShare,
    shareToFriend,
    poster,
    categories,
    yearLabel,
  }
}
