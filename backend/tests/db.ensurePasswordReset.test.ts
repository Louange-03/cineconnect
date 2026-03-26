import { beforeEach, describe, expect, it, vi } from "vitest"

const { poolQuery } = vi.hoisted(() => ({
  poolQuery: vi.fn(),
}))

vi.mock("../src/db/client.js", () => ({
  pool: { query: poolQuery },
}))

describe("ensurePasswordResetSchema", () => {
  beforeEach(() => {
    poolQuery.mockReset()
    poolQuery.mockResolvedValue(undefined)
  })

  it("exécute les requêtes idempotentes", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    poolQuery.mockRejectedValueOnce(new Error("no extension"))
    const { ensurePasswordResetSchema } = await import("../src/db/ensurePasswordResetSchema.js")
    await ensurePasswordResetSchema()
    expect(poolQuery.mock.calls.length).toBeGreaterThanOrEqual(5)
    warn.mockRestore()
  })
})
