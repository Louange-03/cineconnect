import { afterEach, describe, expect, it } from "vitest"
import {
  clearToken,
  getToken,
  setToken,
  getUser,
  setUser,
  clearUser,
  isAuthenticated,
  logout,
} from "./auth"
import type { User } from "../types"

const sampleUser: User = {
  id: "u1",
  email: "a@b.co",
  username: "alice",
}

describe("auth stockage localStorage", () => {
  afterEach(() => {
    localStorage.clear()
  })

  it("jeton: set, get, clear", () => {
    expect(getToken()).toBeNull()
    setToken("tok")
    expect(getToken()).toBe("tok")
    clearToken()
    expect(getToken()).toBeNull()
  })

  it("utilisateur JSON: set, get, clear", () => {
    expect(getUser()).toBeNull()
    setUser(sampleUser)
    expect(getUser()).toEqual(sampleUser)
    clearUser()
    expect(getUser()).toBeNull()
  })

  it("isAuthenticated suit le jeton", () => {
    expect(isAuthenticated()).toBe(false)
    setToken("x")
    expect(isAuthenticated()).toBe(true)
  })

  it("logout efface token et user", () => {
    setToken("t")
    setUser(sampleUser)
    logout()
    expect(getToken()).toBeNull()
    expect(getUser()).toBeNull()
  })
})
