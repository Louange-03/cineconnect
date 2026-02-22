import { apiClient } from "./apiClient"
import type { User } from "../types"

const TOKEN_KEY = "cineconnect_token"
const USER_KEY = "cineconnect_user"

// the API base URL is handled by apiClient; no need for a second constant here

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

/** Auth API */
export async function register({ email, username, password }: { email: string; username: string; password: string }) {
  const data = await apiClient.post<{ token: string; user: User }>('/auth/register', {
    email,
    username,
    password,
  })

  if (data?.token) setToken(data.token)
  if (data?.user) setUser(data.user)

  return data
}

export async function login({ email, password }: { email: string; password: string }) {
  const data = await apiClient.post<{ token: string; user: User }>('/auth/login', {
    email,
    password,
  })

  if (data?.token) setToken(data.token)
  if (data?.user) setUser(data.user)

  return data
}

export async function fetchMe() {
  const token = getToken()
  if (!token) throw new Error('Non connecté')

  const data = await apiClient.get<{ user: User }>('/auth/me')

  if (data?.user) setUser(data.user)
  return data?.user
}

