import { getToken } from "./token"
import type { ApiRequestOptions } from "../types"

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3000"

if (!import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL not defined, defaulting to http://localhost:3000")
}

interface RequestOptions {
  method?: string
  body?: any
  auth?: boolean
}

async function request(path: string, { method = "GET", body, auth = true }: RequestOptions = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" }

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const url = `${API_URL}${path}`
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

  return data
  } catch (e) {
    // rethrow with context
    const err = e as Error
    throw new Error(err.message || `Failed to fetch ${url}`)
  }
}

export const apiClient = {
  get: (path: string, opts?: ApiRequestOptions) => request(path, { ...opts, method: "GET" }),
  post: (path: string, body?: any, opts?: ApiRequestOptions) =>
    request(path, { ...opts, method: "POST", body }),
}
