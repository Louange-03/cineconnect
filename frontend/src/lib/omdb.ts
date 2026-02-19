import type { OMDBMovie, OMDBMovieDetail } from "../types"
import { apiClient } from "./apiClient"

// pas besoin de clé côté client ; backend se charge de la requête

export async function omdbSearch(query: string): Promise<OMDBMovie[]> {
  if (!query) return []
  const data = await apiClient.post<{ Search: OMDBMovie[] }>(`/films/search`, { query }, { auth: false })
  return data?.Search || []
}

export async function omdbGetById(id: string): Promise<OMDBMovieDetail> {
  const data = await apiClient.post<OMDBMovieDetail>(`/films/detail`, { id }, { auth: false })
  return data
}
