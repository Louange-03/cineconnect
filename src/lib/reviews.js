const STORAGE_KEY = "cineconnect_reviews"

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getReviewsByFilmId(filmId) {
  const all = readAll()
  return all[filmId] || []
}

export function addReview(filmId, review) {
  const all = readAll()
  const current = all[filmId] || []

  // ✅ 1 review par user par film : on remplace l'ancienne
  const withoutUser = current.filter((r) => r.userId !== review.userId)

  const next = [review, ...withoutUser]
  all[filmId] = next
  writeAll(all)
  return next
}

export function deleteReview(filmId, reviewId) {
  const all = readAll()
  const current = all[filmId] || []
  const next = current.filter((r) => r.id !== reviewId)

  all[filmId] = next
  writeAll(all)
  return next
}
