import axios from "axios"
import { buildApiUrl } from "../lib/apiUrl"
import { getToken } from "../lib/auth"

export const getFriends = async () => {
  const res = await axios.get(buildApiUrl("/api/friends"), {
    withCredentials: true,
  })
  return res.data
}

const API = "/api"

function authHeader(): HeadersInit {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export type Friend = {
  id: string
  username: string
  email?: string
}

export type FriendRequest = {
  friendshipId?: string
  fromUserId: string
  fromUsername: string
  email?: string
  sentAt?: string
  createdAt?: string
}

export type SentRequest = {
  toUserId: string
  toUsername: string
}

export type UserItem = {
  id: string
  username: string
  email: string
}

export async function fetchFriends(): Promise<{ friends: Friend[] }> {
  const res = await fetch(buildApiUrl(`${API}/friends`), { headers: authHeader() })
  if (!res.ok) throw new Error("Erreur chargement amis")
  return res.json() as Promise<{ friends: Friend[] }>
}

export async function fetchRequests(): Promise<{ requests: FriendRequest[] }> {
  const res = await fetch(buildApiUrl(`${API}/friends/requests`), { headers: authHeader() })
  if (!res.ok) throw new Error("Erreur chargement demandes")
  return res.json() as Promise<{ requests: FriendRequest[] }>
}

export async function fetchUsers(): Promise<UserItem[]> {
  const res = await fetch(buildApiUrl(`${API}/users`), { headers: authHeader() })
  if (!res.ok) throw new Error("Erreur chargement utilisateurs")
  const data = (await res.json()) as { users?: UserItem[] }
  return Array.isArray(data.users) ? data.users : []
}

export async function fetchSentRequests(): Promise<{ sent: SentRequest[] }> {
  const res = await fetch(buildApiUrl(`${API}/friends/sent`), { headers: authHeader() })
  if (!res.ok) throw new Error("Erreur chargement demandes envoyées")
  return res.json() as Promise<{ sent: SentRequest[] }>
}

export async function acceptFriendRequest(userId: string): Promise<void> {
  const res = await fetch(buildApiUrl(`${API}/friends/accept`), {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) throw new Error("Erreur acceptation")
}

export async function rejectFriendRequest(userId: string): Promise<void> {
  const res = await fetch(buildApiUrl(`${API}/friends/reject`), {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) throw new Error("Erreur refus")
}

export async function removeFriend(userId: string): Promise<void> {
  const res = await fetch(buildApiUrl(`${API}/friends/${userId}`), {
    method: "DELETE",
    headers: authHeader(),
  })
  if (!res.ok) throw new Error("Erreur suppression")
}

export async function createFriendRequest(userId: string): Promise<void> {
  const res = await fetch(buildApiUrl(`${API}/friends/request`), {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) throw new Error("Erreur envoi demande")
}

export async function startConversation(userId: string): Promise<void> {
  const res = await fetch(buildApiUrl(`${API}/messages/start`), {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) throw new Error("Erreur création conversation")
}