import { useQuery } from "@tanstack/react-query"
import { isAuthenticated } from "../lib/token"
import { fetchMe } from "../lib/userApi"

export function useAuth() {
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
