import { apiClient } from "./apiClient"
import type { User } from "../types"

interface MeResponse {
  user: User | null
}

export function fetchMe(): Promise<MeResponse> {
  return apiClient.get<MeResponse>("/auth/me")
}

export interface UsersResponse {
  users: User[]
}

export function fetchUsers(): Promise<UsersResponse> {
  return apiClient.get<UsersResponse>("/users")
}
