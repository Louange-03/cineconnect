import type { Film } from "../types"

const FALLBACK_POSTER = "https://via.placeholder.com/900x1350/0b1020/ffffff?text=No+Image"
const TMDB_CDN = "https://image.tmdb.org/t/p"
const TMDB_SIZE = "w780"

function toSafeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function parseMetadata(metadata?: string | null): Record<string, unknown> | null {
  const raw = toSafeString(metadata)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

function normalizePosterUrl(input: string): string {
  const lower = input.toLowerCase()
  if (!input || lower === "n/a") return ""
  if (input.startsWith("//")) return `https:${input}`
  if (input.startsWith("http://") || input.startsWith("https://")) {
    // Prefer slightly larger posters for cleaner cards.
    return input.replace("/t/p/w500", `/t/p/${TMDB_SIZE}`)
  }
  if (input.startsWith("/")) return `${TMDB_CDN}/${TMDB_SIZE}${input}`
  return ""
}

function fromMetadata(meta: Record<string, unknown> | null): string {
  if (!meta) return ""
  const candidates = [
    meta.poster_path,
    meta.posterPath,
    meta.Poster,
    meta.poster,
  ]
  for (const candidate of candidates) {
    const normalized = normalizePosterUrl(toSafeString(candidate))
    if (normalized) return normalized
  }
  return ""
}

export function resolvePosterUrl(film?: Pick<Film, "posterUrl" | "metadata"> | null): string {
  if (!film) return FALLBACK_POSTER
  const fromPosterField = normalizePosterUrl(toSafeString(film.posterUrl))
  if (fromPosterField) return fromPosterField

  const fromMeta = fromMetadata(parseMetadata(film.metadata))
  if (fromMeta) return fromMeta
  return FALLBACK_POSTER
}

export { FALLBACK_POSTER }
