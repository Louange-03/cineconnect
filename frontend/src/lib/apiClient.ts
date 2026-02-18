import { getToken } from "./token"

const API_URL = import.meta.env.VITE_API_URL as string

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
    throw new Error((data as any)?.message || "Erreur serveur")
  }

  return data as T
}

export const apiClient = {
  get: <T = any>(path: string, opts?: Omit<RequestOptions, "method">) =>
    request<T>(path, { ...opts, method: "GET" }),
  post: <T = any>(
    path: string,
    body?: any,
    opts?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(path, { ...opts, method: "POST", body }),
}
