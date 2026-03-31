import { beforeEach, describe, expect, it, vi } from "vitest"
import { getFriends } from "./friends.service"
import axios from "axios"

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}))

describe("friends.service", () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockReset()
  })

  it("getFriends appelle l'endpoint avec credentials", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [{ id: "u1" }] })
    const data = await getFriends()
    expect(data).toEqual([{ id: "u1" }])
    expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/friends$/), {
      withCredentials: true,
    })
  })
})
