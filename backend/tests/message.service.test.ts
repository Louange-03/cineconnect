import { beforeEach, describe, expect, it, vi } from "vitest"

const { poolQuery, isFriendMock } = vi.hoisted(() => ({
  poolQuery: vi.fn(),
  isFriendMock: vi.fn(),
}))

vi.mock("../src/db/client.js", () => ({
  pool: { query: poolQuery },
}))

vi.mock("../src/utils/isFriends", () => ({
  isFriend: isFriendMock,
}))

describe("message.service startConversation", () => {
  beforeEach(() => {
    poolQuery.mockReset()
    isFriendMock.mockReset()
  })

  it("rejette si pas amis", async () => {
    isFriendMock.mockResolvedValue(false)
    const { startConversation } = await import("../src/services/message.service.js")
    await expect(startConversation("u1", "u2")).rejects.toThrow("Not friends")
  })

  it("retourne conversation existante", async () => {
    isFriendMock.mockResolvedValue(true)
    poolQuery.mockResolvedValueOnce({ rows: [{ id: "conv-1" }], rowCount: 1 })
    const { startConversation } = await import("../src/services/message.service.js")
    await expect(startConversation("u1", "u2")).resolves.toBe("conv-1")
  })

  it("rowCount nullish traité comme 0", async () => {
    isFriendMock.mockResolvedValue(true)
    poolQuery
      .mockResolvedValueOnce({ rows: [], rowCount: null })
      .mockResolvedValueOnce({ rows: [{ id: "nc" }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 2 })
    const { startConversation } = await import("../src/services/message.service.js")
    await expect(startConversation("u1", "u2")).resolves.toBe("nc")
  })

  it("crée conversation et membres", async () => {
    isFriendMock.mockResolvedValue(true)
    poolQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ id: "new-c" }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 2 })
    const { startConversation } = await import("../src/services/message.service.js")
    await expect(startConversation("u1", "u2")).resolves.toBe("new-c")
    expect(poolQuery).toHaveBeenCalledTimes(3)
  })
})
