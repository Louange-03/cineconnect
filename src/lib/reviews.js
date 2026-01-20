const KEY = "cineconnect.reviews.v1"

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}")
  } catch {
    return {}
  }
}

function writeAll(all) {
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function getReviewsByFilmId(filmId) {
  const all = readAll()
  return all[filmId] || []
}

export function addReview(filmId, review) {
  const all = readAll()
  const list = all[filmId] || []
  const next = [review, ...list]
  all[filmId] = next
  writeAll(all)
  return next
}

export function deleteReview(filmId, reviewId) {
  const all = readAll()
  const list = all[filmId] || []
  all[filmId] = list.filter((r) => r.id !== reviewId)
  writeAll(all)
  return all[filmId]
}
