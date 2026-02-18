import { setToken as setAuthToken, getToken as getAuthToken, clearToken as clearAuthToken } from "./token"
import type { User } from "../types"

const USER_KEY = "cineconnect_user"

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as User) : null
}

export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken())
}

export function logout(): void {
  clearAuthToken()
  clearUser()
}
