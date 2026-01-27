const KEY = "cineconnect.reviews.v1"

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}")
  } catch {
    return {}
  }
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getReviewsByFilmId(filmId) {
  const data = read()
  return data[filmId] || []
}

export function addReview(filmId, review) {
  const data = read()
  const list = data[filmId] || []

  // 1 review par utilisateur
  const filtered = list.filter((r) => r.userId !== review.userId)

  const next = {
    ...data,
    [filmId]: [review, ...filtered],
  }

  write(next)
  return next[filmId]
}

export function deleteReview(filmId, reviewId) {
  const data = read()
  const list = data[filmId] || []

  const next = {
    ...data,
    [filmId]: list.filter((r) => r.id !== reviewId),
  }

  write(next)
  return next[filmId]
}
