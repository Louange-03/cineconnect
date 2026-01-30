const API_KEY = import.meta.env.VITE_OMDB_API_KEY
const BASE_URL = "https://www.omdbapi.com/"

// ✅ Debug : vérifie que Vite lit bien la clé (à enlever après test)
console.log("OMDB KEY =", API_KEY)

function ensureKey() {
  if (!API_KEY) {
    throw new Error(
      "Clé OMDb manquante : ajoute VITE_OMDB_API_KEY dans .env puis relance pnpm dev"
    )
  }
}

export async function omdbSearch(query) {
  ensureKey()
  if (!query) return []

  const res = await fetch(
    `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`
  )
  const data = await res.json()
  return data?.Search || []
}

export async function omdbGetById(id) {
  ensureKey()
  const res = await fetch(
    `${BASE_URL}?apikey=${API_KEY}&i=${encodeURIComponent(id)}&plot=full`
  )
  const data = await res.json()

  if (data?.Response === "False") {
    throw new Error(data?.Error || "Film introuvable")
  }
  return data
}
