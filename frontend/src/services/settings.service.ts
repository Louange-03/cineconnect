import { buildApiUrl } from "../lib/apiUrl"
import { getToken } from "../lib/auth"

function authHeader(): HeadersInit {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function patchMe(body: { email?: string; password?: string }): Promise<void> {
  const res = await fetch(buildApiUrl("/api/users/me"), {
    method: "PATCH",
    headers: authHeader(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = (await res.json()) as { message?: string }
    throw new Error(data.message ?? "Erreur serveur")
  }
}
