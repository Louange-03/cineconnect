import { apiClient } from "./apiClient"
import type { User } from "../types"

export function fetchMe(): Promise<{ user: User }> {
  return apiClient.get("/auth/me")
}

export function fetchUsers(): Promise<{ users: User[] }> {
  return apiClient.get("/users")
}
