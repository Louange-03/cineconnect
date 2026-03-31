import axios from "axios"
import { getToken } from "../lib/auth"
import { buildApiUrl } from "../lib/apiUrl"
import type { Conversation, Message } from "../types"

export type ShareFilmItem = {
  id: string
  title: string
  year?: string | null
  posterUrl?: string | null
  poster_url?: string | null
}

function authHeaders() {
  const token = getToken()
  return { Authorization: `Bearer ${token}` }
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await axios.get<Conversation[]>(buildApiUrl("/api/conversations"), { headers: authHeaders() })
  return res.data
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await axios.get<Message[]>(buildApiUrl(`/api/conversations/${conversationId}/messages`), {
    headers: authHeaders(),
  })
  return res.data
}

export async function fetchShareFilms(): Promise<ShareFilmItem[]> {
  const token = getToken()
  if (!token) return []
  const res = await fetch(buildApiUrl("/api/films?limit=10000"), {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Erreur chargement films")
  const data = (await res.json()) as { films?: ShareFilmItem[] }
  return Array.isArray(data.films) ? data.films : []
}
