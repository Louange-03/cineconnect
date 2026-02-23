import { useQuery } from "@tanstack/react-query"
import type { Category } from "../types"

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/films/categories")
  if (!res.ok) throw new Error("Erreur lors du chargement des catégories")
  const data = await res.json()
  return data.categories || []
}

export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })
}
