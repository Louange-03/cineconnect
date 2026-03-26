import { beforeEach, describe, expect, it } from "vitest"
import { addReview, deleteReview, getReviewsByFilmId } from "./reviews"
import type { Review } from "../types"

const KEY = "cineconnect.reviews.v1"

const sample = (over: Partial<Review> = {}): Review => ({
  id: "r1",
  userId: "u1",
  username: "alice",
  rating: 5,
  comment: "ok",
  createdAt: "2020-01-01",
  ...over,
})

describe("reviews (localStorage)", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("getReviewsByFilmId vide", () => {
    expect(getReviewsByFilmId("f1")).toEqual([])
  })

  it("read ignore JSON invalide", () => {
    localStorage.setItem(KEY, "not-json")
    expect(getReviewsByFilmId("f1")).toEqual([])
  })

  it("addReview ajoute et remplace avis du même user", () => {
    addReview("f1", sample({ id: "a", userId: "u1" }))
    const second = sample({ id: "b", userId: "u1", rating: 3 })
    const list = addReview("f1", second)
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe("b")
  })

  it("addReview conserve d’autres utilisateurs", () => {
    addReview("f1", sample({ id: "a", userId: "u1" }))
    addReview("f1", sample({ id: "b", userId: "u2", username: "bob" }))
    expect(getReviewsByFilmId("f1")).toHaveLength(2)
  })

  it("deleteReview retire l’avis", () => {
    addReview("f1", sample({ id: "r-del", userId: "u1" }))
    const left = deleteReview("f1", "r-del")
    expect(left).toEqual([])
    expect(getReviewsByFilmId("f1")).toEqual([])
  })

  it("deleteReview sur film inconnu", () => {
    expect(deleteReview("missing", "r")).toEqual([])
  })
})
