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
  const res = await axios.get<Conversation[] | { conversations?: Conversation[] }>(
    buildApiUrl("/api/conversations"),
    { headers: authHeaders() },
  )
  const payload = res.data
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.conversations)) return payload.conversations
  return []
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await axios.get<Message[] | { messages?: Message[] }>(buildApiUrl(`/api/conversations/${conversationId}/messages`), {
    headers: authHeaders(),
  })
  const payload = res.data
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.messages)) return payload.messages
  return []
}

export async function fetchShareFilms(): Promise<ShareFilmItem[]> {
  const token = getToken()
  if (!token) return []
  const res = await fetch(buildApiUrl("/api/films?limit=10000"), {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Erreur chargement films")
  const data = (await res.json()) as { films?: ShareFilmItem[] } | ShareFilmItem[]
  if (Array.isArray(data)) return data
  return Array.isArray(data.films) ? data.films : []
}
