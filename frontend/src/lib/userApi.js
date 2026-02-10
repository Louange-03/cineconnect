import { apiClient } from "./apiClient"

export function fetchMe() {
  return apiClient.get("/auth/me")
}

export function fetchUsers() {
  return apiClient.get("/users")
}
