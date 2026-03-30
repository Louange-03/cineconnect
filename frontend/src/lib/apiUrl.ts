import { readViteEnv } from "./viteEnv"

const RAW = (readViteEnv("VITE_API_URL") ?? "").trim()
const BASE = RAW.replace(/\/$/, "")

/** Avec VITE_API_URL (prod) : URL absolue. Sinon chemin relatif pour le proxy Vite en dev. */
export function buildApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  return BASE ? `${BASE}${p}` : p
}
