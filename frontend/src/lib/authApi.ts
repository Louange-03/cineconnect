import { apiClient } from "./apiClient"
import { setToken } from "./token"
import { AuthResponse } from '../types'

interface RegisterParams {
  email: string
  username: string
  password: string
}

interface LoginParams {
  email: string
  password: string
}

export async function register(params: RegisterParams): Promise<AuthResponse> {
  const data = await apiClient.post<AuthResponse>(
    "/auth/register", 
    params, 
    { auth: false }
  )
  if (data?.token) setToken(data.token)
  return data
}

export async function login(params: LoginParams): Promise<AuthResponse> {
  const data = await apiClient.post<AuthResponse>(
    "/auth/login", 
    params, 
    { auth: false }
  )
  if (data?.token) setToken(data.token)
  return data
}
