import { apiClient } from "./apiClient"
import { setToken } from "./token"

export async function register({ email, username, password }) {
  const data = await apiClient.post("/auth/register", { email, username, password }, { auth: false })
  if (data?.token) setToken(data.token)
  return data
}

export async function login({ email, password }) {
  const data = await apiClient.post("/auth/login", { email, password }, { auth: false })
  if (data?.token) setToken(data.token)
  return data
}
