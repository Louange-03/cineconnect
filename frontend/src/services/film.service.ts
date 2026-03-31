import axios from "axios"
import { getToken } from "../lib/auth"
import { buildApiUrl } from "../lib/apiUrl"
import { connectSocket, socket } from "../socket"
import { resolvePosterUrl } from "../lib/poster"
import type { Film } from "../types"

export type ShareFriend = {
  id: string
  username: string
  email?: string
}

export async function toggleFavoriteFilm(filmId: string, isFavorite: boolean): Promise<void> {
  const token = getToken()
  if (!token) throw new Error("AUTH_REQUIRED")

  let targetFilmId = filmId
  if (/^tt\d+$/i.test(targetFilmId)) {
    const imported = await fetch(buildApiUrl("/api/films/import"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imdbID: targetFilmId }),
    })
    if (!imported.ok) throw new Error("IMPORT_REQUIRED_FAILED")
    const importedData = await imported.json()
    targetFilmId = importedData?.film?.id ?? targetFilmId
  }

  await axios({
    method: isFavorite ? "post" : "delete",
    url: buildApiUrl(`/api/users/me/favorites/${targetFilmId}`),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function fetchShareFriends(): Promise<ShareFriend[]> {
  const token = getToken()
  if (!token) throw new Error("AUTH_REQUIRED")

  const res = await fetch(buildApiUrl("/api/friends"), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error("LOAD_FRIENDS_FAILED")
  const data = (await res.json()) as { friends?: ShareFriend[] }
  return Array.isArray(data.friends) ? data.friends : []
}

export async function shareFilmToFriend(film: Film, friend: ShareFriend): Promise<void> {
  const token = getToken()
  if (!token) throw new Error("AUTH_REQUIRED")

  const filmUrl = `${window.location.origin}/film/${film.id}`
  const posterUrl = resolvePosterUrl(film)
  const text =
    `Je te partage ce film: ${film.title} (${film.year || "—"})\n` +
    `POSTER:${posterUrl}\n` +
    `${filmUrl}`

  const started = await fetch(buildApiUrl("/api/messages/start"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId: friend.id }),
  })
  if (!started.ok) throw new Error("START_CONVERSATION_FAILED")
  const payload = (await started.json()) as { conversationId?: string }
  if (!payload.conversationId) throw new Error("CONVERSATION_NOT_FOUND")

  connectSocket()
  socket.emit("send-message", {
    conversationId: payload.conversationId,
    text,
  })
}
