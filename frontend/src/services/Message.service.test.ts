import { beforeEach, describe, expect, it, vi } from "vitest"
import { getMessages } from "./Message.service"
import axios from "axios"

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}))

describe("Message.service", () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockReset()
  })

  it("getMessages appelle l'endpoint avec friendId", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [{ id: "m1" }] })
    const data = await getMessages(42)
    expect(data).toEqual([{ id: "m1" }])
    expect(axios.get).toHaveBeenCalledWith("/api/messages/42", {
      withCredentials: true,
    })
  })
})
