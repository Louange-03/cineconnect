/** Normalisation pour comparer noms de catégories (fr / en). */
export function normalizeFilmToken(v: string) {
  return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
}

/**
 * Détecte une série TV via les catégories (ex. OMDb « Série »), sans exclure les films TMDB
 * dont un libellé contiendrait par erreur « tv » (ex. faux positif sur includes("tv")).
 */
export function isTvSeriesCategories(categories: string[] | null | undefined): boolean {
  if (!categories?.length) return false
  return categories.some((c) => {
    const n = normalizeFilmToken(c)
    if (n === "serie" || n === "series") return true
    if (n.startsWith("serie ") || n.startsWith("series ")) return true
    if (n.includes("televis") || n.includes("miniserie") || n.includes("mini-serie")) return true
    return false
  })
}

/** Métadonnées OMDb / import (champ `Type`). */
export function isSeriesFromMetadata(metadata: string | null | undefined): boolean {
  if (!metadata?.trim()) return false
  try {
    const m = JSON.parse(metadata) as Record<string, unknown>
    const t = String(m.Type ?? m.type ?? "").toLowerCase()
    return t === "series"
  } catch {
    return false
  }
}

/** Catalogue / filtres : série si meta OMDb ou catégories explicites (TMDB reste « film »). */
export function isSeriesFilmListed(f: {
  categories?: string[] | null
  metadata?: string | null
}): boolean {
  if (isSeriesFromMetadata(f.metadata)) return true
  return isTvSeriesCategories(f.categories)
}
