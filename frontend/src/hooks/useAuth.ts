import { useQuery } from "@tanstack/react-query"
import { isAuthenticated } from "../lib/token"
import { fetchMe } from "../lib/userApi"
import { getUser } from "../lib/auth"
import type { User } from "../types"

interface UseAuthResult {
  isAuth: boolean
  user: User | null
  isLoading: boolean
  error: unknown
}

export function useAuth(): UseAuthResult {
  const isAuth = isAuthenticated()
  // boot with stored user to avoid blank state after login/register
  const stored = getUser()

  const query = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: isAuth,
    staleTime: 60_000,
  })

  return {
    isAuth,
    // prefer fetched data but fall back to local storage
    user: query.data?.user ?? stored ?? null,
    isLoading: query.isLoading,
    error: query.error,
  }
}
