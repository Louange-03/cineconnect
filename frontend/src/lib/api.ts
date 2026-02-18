const BASE_URL = import.meta.env.VITE_API_URL as string

if (!BASE_URL) {
  console.warn("VITE_API_URL manquant dans .env")
}

interface ApiOptions extends RequestInit {
  token?: string
}

export async function apiFetch<T = any>(
  path: string,
  { token, ...options }: ApiOptions = {}
): Promise<T> {
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
    const message = (data as any)?.message || `Erreur API (${res.status})`
    throw new Error(message)
  }

  return data as T
}
