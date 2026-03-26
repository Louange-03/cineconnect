import { beforeEach, describe, expect, it, vi } from "vitest"

const { poolQuery } = vi.hoisted(() => ({
  poolQuery: vi.fn(),
}))

vi.mock("../src/db/client.js", () => ({
  pool: { query: poolQuery },
}))

import { isFriend } from "../src/utils/isFriends"

describe("isFriend", () => {
  beforeEach(() => {
    poolQuery.mockReset()
  })

  it("true si une ligne", async () => {
    poolQuery.mockResolvedValue({ rows: [{ ok: 1 }] })
    await expect(isFriend("a", "b")).resolves.toBe(true)
    expect(poolQuery).toHaveBeenCalledTimes(1)
  })

  it("false si aucune ligne", async () => {
    poolQuery.mockResolvedValue({ rows: [] })
    await expect(isFriend("a", "b")).resolves.toBe(false)
  })
})
