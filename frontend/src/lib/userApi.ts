import { apiClient } from "./apiClient"
import type { User } from "../types"

export function fetchMe(): Promise<{ user: User }> {
  return apiClient.get("/api/auth/me")
}

export function fetchUsers(): Promise<{ users: User[] }> {
  return apiClient.get("/api/users")
}
