const KEY = "cineconnect.reviews.v1"

export interface Review {
  id: string
  userId: string
  rating: number
  comment: string
  createdAt: string
}

function read(): Record<string, Review[]> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}")
  } catch {
    return {}
  }
}

function write(data: Record<string, Review[]>): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getReviewsByFilmId(filmId: string): Review[] {
  const data = read()
  return data[filmId] || []
}

export function addReview(filmId: string, review: Review): Review[] {
  const data = read()
  const list = data[filmId] || []

  const filtered = list.filter((r) => r.userId !== review.userId)

  const next = {
    ...data,
    [filmId]: [review, ...filtered],
  }

  write(next)
  return next[filmId]
}

export function deleteReview(filmId: string, reviewId: string): Review[] {
  const data = read()
  const list = data[filmId] || []

  const next = {
    ...data,
    [filmId]: list.filter((r) => r.id !== reviewId),
  }

  write(next)
  return next[filmId]
}
