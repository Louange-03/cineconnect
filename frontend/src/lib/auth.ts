import { apiClient } from "./apiClient"
import type { User } from "../types"

const TOKEN_KEY = "cineconnect_token"
const USER_KEY = "cineconnect_user"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearUser() {
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getToken())
}

export function logout() {
  clearToken()
  clearUser()
}

/** Helpers HTTP */
async function apiFetch(path: string, { method = "GET", body, token }: { method?: string; body?: any; token?: string } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data?.message || "Erreur API")
  }
  return data
}

/** Auth API */
export async function register({ email, username, password }: { email: string; username: string; password: string }) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: { email, username, password },
  })

  if (data?.token) setToken(data.token)
  if (data?.user) setUser(data.user)

  return data
}

export async function login({ email, password }: { email: string; password: string }) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  })

  if (data?.token) setToken(data.token)
  if (data?.user) setUser(data.user)

  return data
}

export async function fetchMe() {
  const token = getToken()
  if (!token) throw new Error("Non connecté")

  const data = await apiFetch("/auth/me", { token })

  if (data?.user) setUser(data.user)
  return data?.user
}
