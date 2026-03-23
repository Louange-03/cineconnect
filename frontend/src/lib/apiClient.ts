import { getToken } from "./auth"
import type { ApiRequestOptions } from "../types"

/**
 * Si VITE_API_URL est défini, on l'utilise (ex: http://localhost:3001).
 * Sinon on passe par le proxy Vite avec des chemins relatifs (/api/...).
 */
const RAW_API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? ""
const API_URL = RAW_API_URL.replace(/\/$/, "")

interface RequestOptions {
  method?: string
  body?: any
  auth?: boolean
}

async function request<T = any>(path: string, { method = "GET", body, auth = true }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = `${API_URL}${normalizedPath}`
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    const data = text ? JSON.parse(text) : null

    if (!res.ok) {
      throw new Error(data?.message || `Erreur serveur (${res.status})`)
    }

    return data as T
  } catch (e) {
    const err = e as Error
    throw new Error(err.message || `Failed to fetch ${url}`)
  }
}

export const apiClient = {
  get: <T = any>(path: string, opts?: ApiRequestOptions): Promise<T> => request<T>(path, { ...opts, method: "GET" }),
  post: <T = any>(path: string, body?: any, opts?: ApiRequestOptions): Promise<T> =>
    request<T>(path, { ...opts, method: "POST", body }),
}
