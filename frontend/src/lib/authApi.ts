import { apiClient } from "./apiClient"
import { setToken } from "./token"
import { setUser } from "./auth"
import type { AuthResponse, User } from "../types"

interface RegisterData {
  email: string
  username: string
  password: string
}

interface LoginData {
  email: string
  password: string
}

function storeAuth(res: AuthResponse) {
  if (res?.token) setToken(res.token)
  if (res?.user) setUser(res.user as User)
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/register", data, { auth: false })
  storeAuth(res)
  return res
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/login", data, { auth: false })
  storeAuth(res)
  return res
}
