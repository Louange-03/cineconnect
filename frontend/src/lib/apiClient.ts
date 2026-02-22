import { getToken } from "./auth"
import type { ApiRequestOptions } from "../types"

// backend listens on 3001 by default; make the fallback match
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3001"

if (!import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL not defined, defaulting to http://localhost:3001")
}


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

  const url = `${API_URL}${path}`
  console.log("apiClient request", { url, method, body, auth, headers })
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    console.log("apiClient response status", res.status)
    const text = await res.text()
    console.log("apiClient response text", text)
    const data = text ? JSON.parse(text) : null

    if (!res.ok) {
      throw new Error(data?.message || `Erreur serveur (${res.status})`)
    }

    return data as T
  } catch (e) {
    // rethrow with context
    const err = e as Error
    console.error("apiClient error", err)
    throw new Error(err.message || `Failed to fetch ${url}`)
  }
}

export const apiClient = {
  get: <T = any>(path: string, opts?: ApiRequestOptions): Promise<T> => request<T>(path, { ...opts, method: "GET" }),
  post: <T = any>(path: string, body?: any, opts?: ApiRequestOptions): Promise<T> =>
    request<T>(path, { ...opts, method: "POST", body }),
}
