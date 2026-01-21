const KEY = "cineconnect.reviews.v1"

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}

function write(value) {
  localStorage.setItem(KEY, JSON.stringify(value))
}

export function getReviewsByFilmId(filmId) {
  return read()
    .filter((r) => r.filmId === filmId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    )
}

// 1 review max par user par film : update si existe sinon create
export function upsertReview({ filmId, userId, username, rating, comment }) {
  const all = read()
  const now = new Date().toISOString()

  const idx = all.findIndex((r) => r.filmId === filmId && r.userId === userId)

  if (idx >= 0) {
    const updated = {
      ...all[idx],
      rating,
      comment,
      updatedAt: now,
    }
    const next = [...all]
    next[idx] = updated
    write(next)
    return updated
  }

  const created = {
    id: crypto.randomUUID(),
    filmId,
    userId,
    username,
    rating,
    comment,
    createdAt: now,
    updatedAt: now,
  }

  write([created, ...all])
  return created
}

// Supprime uniquement si c'est l'auteur
export function deleteReview(reviewId, userId) {
  const all = read()
  const next = all.filter((r) => !(r.id === reviewId && r.userId === userId))
  write(next)
  return next
}
