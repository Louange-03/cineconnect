import axios from "axios"
import { getToken } from "../lib/auth"
import { buildApiUrl } from "../lib/apiUrl"

export type FavoriteFilm = {
  id: number
  title: string
  year: string
  posterUrl: string | null
}

export async function updateMyPassword(newPassword: string): Promise<void> {
  const token = getToken()
  await axios.put(
    buildApiUrl("/api/users/me/password"),
    { password: newPassword },
    { headers: { Authorization: `Bearer ${token}` } },
  )
}

export async function deleteMyAccount(): Promise<void> {
  const token = getToken()
  await axios.delete(buildApiUrl("/api/users/me"), {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function fetchMyFavorites(): Promise<FavoriteFilm[]> {
  const token = getToken()
  if (!token) return []
  const res = await axios.get(buildApiUrl("/api/users/me/favorites"), {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data?.favorites ?? []
}
