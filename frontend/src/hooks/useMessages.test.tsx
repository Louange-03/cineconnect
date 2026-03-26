import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useConversation, useInbox, useSendMessage } from "./useMessages"
import { getToken } from "../lib/auth"
import { createTestQueryWrapper } from "../test/queryClientWrapper"

vi.mock("../lib/auth", () => ({
  getToken: vi.fn(),
}))

describe("useMessages", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    vi.mocked(getToken).mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("useInbox sans token → []", async () => {
    vi.mocked(getToken).mockReturnValue(null)
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useInbox(), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("useInbox OK", async () => {
    vi.mocked(getToken).mockReturnValue("t")
    const item = {
      userId: "u1",
      username: "bob",
      lastMessage: {
        id: "m1",
        senderId: "a",
        receiverId: "b",
        content: "hi",
        read: true,
        createdAt: "2020",
      },
    }
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ inbox: [item] }) } as Response)
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useInbox(), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data?.[0]?.username).toBe("bob")
    })
  })

  it("useInbox inbox absent", async () => {
    vi.mocked(getToken).mockReturnValue("t")
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) } as Response)
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useInbox(), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
  })

  it("useInbox erreur HTTP", async () => {
    vi.mocked(getToken).mockReturnValue("t")
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) } as Response)
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useInbox(), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/inbox/i)
    })
  })

  it("useConversation null : idle", async () => {
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useConversation(null), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.fetchStatus).toBe("idle")
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("useConversation sans token → []", async () => {
    vi.mocked(getToken).mockReturnValue(null)
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useConversation("u2"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("useConversation sans messages dans le JSON", async () => {
    vi.mocked(getToken).mockReturnValue("t")
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) } as Response)
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useConversation("u88"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data).toEqual([])
    })
  })

  it("useConversation OK", async () => {
    vi.mocked(getToken).mockReturnValue("t")
    const messages = [
      {
        id: "m1",
        senderId: "a",
        receiverId: "b",
        content: "x",
        read: false,
        createdAt: "2020",
      },
    ]
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ messages }) } as Response)
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useConversation("u99"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.data?.[0]?.content).toBe("x")
    })
    expect(fetchMock.mock.calls[0][0]).toContain("/u99")
  })

  it("useConversation erreur HTTP", async () => {
    vi.mocked(getToken).mockReturnValue("t")
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) } as Response)
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useConversation("u2"), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.error?.message).toMatch(/conversation/i)
    })
  })

  it("useSendMessage sans token", async () => {
    vi.mocked(getToken).mockReturnValue(null)
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useSendMessage(), { wrapper: Wrapper })
    await expect(
      act(async () => {
        await result.current.mutateAsync({ receiverId: "r", content: "hi" })
      }),
    ).rejects.toThrow(/Non connecté/)
  })

  it("useSendMessage OK invalide les requêtes", async () => {
    vi.mocked(getToken).mockReturnValue("tok")
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as Response)
    const { client, Wrapper } = createTestQueryWrapper()
    const spy = vi.spyOn(client, "invalidateQueries")
    const { result } = renderHook(() => useSendMessage(), { wrapper: Wrapper })
    await act(async () => {
      await result.current.mutateAsync({ receiverId: "peer", content: "msg" })
    })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["conversation", "peer"] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ["inbox"] })
  })

  it("useSendMessage erreur HTTP", async () => {
    vi.mocked(getToken).mockReturnValue("tok")
    fetchMock.mockResolvedValue({ ok: false, text: async () => "" } as Response)
    const { Wrapper } = createTestQueryWrapper()
    const { result } = renderHook(() => useSendMessage(), { wrapper: Wrapper })
    await expect(
      act(async () => {
        await result.current.mutateAsync({ receiverId: "r", content: "x" })
      }),
    ).rejects.toThrow(/envoi/)
  })
})
