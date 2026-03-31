import type { OMDBMovie } from "../types"

const FALLBACK_POSTER = "https://via.placeholder.com/80x120/0b1020/ffffff?text=No+Image"

export function getOmdbPosterUrl(movie: OMDBMovie): string {
  return movie.Poster && movie.Poster !== "N/A" ? movie.Poster : FALLBACK_POSTER
}

export function limitOmdbResults(results: OMDBMovie[] | undefined, limit = 8): OMDBMovie[] {
  return (results ?? []).slice(0, limit)
}
