import { Review } from '../types'

const KEY = "cineconnect.reviews.v1"

type ReviewsData = Record<string, Review[]>

function read(): ReviewsData {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}")
  } catch {
    return {}
  }
}

function write(data: ReviewsData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getReviewsByFilmId(filmId: string): Review[] {
  const data = read()
  return data[filmId] || []
}

export function addReview(filmId: string, review: Review): Review[] {
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
