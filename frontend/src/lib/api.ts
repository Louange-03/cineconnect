// legacy helper, prefer apiClient.ts
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:3001"

if (!BASE_URL) {
  console.warn("VITE_API_URL manquant dans .env (fallback 3001)")
}

interface FetchOptions extends RequestInit {
  token?: string
}

export async function apiFetch(path: string, { token, ...options }: FetchOptions = {}): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const isJson = res.headers.get("content-type")?.includes("application/json")
  const data = isJson ? await res.json() : null

  if (!res.ok) {
    const message = data?.message || `Erreur API (${res.status})`
    throw new Error(message)
  }

  return data
}
