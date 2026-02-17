import { useQuery } from "@tanstack/react-query"
import { isAuthenticated } from "../lib/token"
import { fetchMe } from "../lib/userApi"
import { User } from "../types"

interface UseAuthResult {
  isAuth: boolean
  user: User | null
  isLoading: boolean
  error: Error | null
}

export function useAuth(): UseAuthResult {
  const isAuth = isAuthenticated()

  const query = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: isAuth,
    staleTime: 60_000,
  })

  return {
    isAuth,
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    error: query.error,
  }
}
