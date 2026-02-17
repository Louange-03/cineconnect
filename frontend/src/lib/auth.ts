import { User, AuthResponse } from '../types'

const TOKEN_KEY = "cineconnect_token"
const USER_KEY = "cineconnect_user"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getToken())
}

export function logout(): void {
  clearToken()
  clearUser()
}

/** Helpers HTTP */
async function apiFetch<T = any>(
  path: string, 
  { method = "GET", body, token }: { method?: string; body?: any; token?: string } = {}
): Promise<T> {
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

interface RegisterParams {
  email: string
  username: string
  password: string
}

interface LoginParams {
  email: string
  password: string
}

/** Auth API */
export async function register(params: RegisterParams): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: params,
  })

  if (data?.token) setToken(data.token)
  if (data?.user) setUser(data.user)

  return data
}

export async function login(params: LoginParams): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: params,
  })

  if (data?.token) setToken(data.token)
  if (data?.user) setUser(data.user)

  return data
}

export async function fetchMe(): Promise<User> {
  const token = getToken()
  if (!token) throw new Error("Non connecté")

  const data = await apiFetch<{ user: User }>("/auth/me", { token })

  if (data?.user) setUser(data.user)
  return data.user
}
