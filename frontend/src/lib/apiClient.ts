import { getToken } from "./token"

const API_URL = import.meta.env.VITE_API_URL

interface RequestOptions {
  method?: string
  body?: any
  auth?: boolean
}

async function request<T = any>(
  path: string, 
  { method = "GET", body, auth = true }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(data?.message || "Erreur serveur")
  }

  return data
}

export const apiClient = {
  get: <T = any>(path: string, opts?: RequestOptions) => 
    request<T>(path, { ...opts, method: "GET" }),
  post: <T = any>(path: string, body?: any, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: "POST", body }),
}
