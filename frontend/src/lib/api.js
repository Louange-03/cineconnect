const BASE_URL = import.meta.env.VITE_API_URL

if (!BASE_URL) {
  console.warn("VITE_API_URL manquant dans .env")
}

export async function apiFetch(path, { token, ...options } = {}) {
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
