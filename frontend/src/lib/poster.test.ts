import { describe, expect, it } from "vitest"
import { resolvePosterUrl } from "./poster"

describe("resolvePosterUrl", () => {
  it("returns posterUrl when already absolute", () => {
    const out = resolvePosterUrl({ posterUrl: "https://example.com/p.jpg", metadata: null })
    expect(out).toBe("https://example.com/p.jpg")
  })

  it("upgrades known CDN poster size", () => {
    const out = resolvePosterUrl({
      posterUrl: "https://image.tmdb.org/t/p/w500/abc.jpg",
      metadata: null,
    })
    expect(out).toContain("/t/p/w780/abc.jpg")
  })

  it("builds URL from metadata poster path", () => {
    const out = resolvePosterUrl({
      posterUrl: null,
      metadata: JSON.stringify({ poster_path: "/xyz.jpg" }),
    })
    expect(out).toBe("https://image.tmdb.org/t/p/w780/xyz.jpg")
  })

  it("falls back to placeholder when no valid poster", () => {
    const out = resolvePosterUrl({ posterUrl: "N/A", metadata: "{}" })
    expect(out).toContain("via.placeholder.com")
  })
})
