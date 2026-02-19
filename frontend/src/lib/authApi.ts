import { apiClient } from "./apiClient"
import { setToken } from "./token"
import type { AuthResponse } from "../types"

export async function register({ email, username, password }: { email: string; username: string; password: string }): Promise<AuthResponse> {
  const data = await apiClient.post<{ token: string; user: any }>(
    "/auth/register",
    { email, username, password },
    { auth: false }
  )
  if (data?.token) setToken(data.token)
  return data as AuthResponse
}

export async function login({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
  const data = await apiClient.post<{ token: string; user: any }>(
    "/auth/login",
    { email, password },
    { auth: false }
  )
  if (data?.token) setToken(data.token)
  return data as AuthResponse
}