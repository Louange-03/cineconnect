import { apiClient } from "./apiClient"
import { User } from '../types'

export function fetchMe(): Promise<{ user: User }> {
  return apiClient.get<{ user: User }>("/auth/me")
}

export function fetchUsers(limit: number = 50): Promise<{ users: User[] }> {
  return apiClient.get<{ users: User[] }>(`/users?limit=${limit}`)
}

export function searchUsers(q: string): Promise<{ users: User[] }> {
  const qs = encodeURIComponent(q || "")
  return apiClient.get<{ users: User[] }>(`/users/search?q=${qs}`)
}
