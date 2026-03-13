import { useQuery } from "@tanstack/react-query"
import type { Category } from "../types"

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/films/categories", {
    headers: {
      Accept: "application/json",
    },
  })

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des catégories")
  }

  const contentType = res.headers.get("content-type") || ""
  const text = await res.text()

  if (!contentType.includes("application/json")) {
    throw new Error("Réponse invalide du serveur (pas du JSON)")
  }

  const data = JSON.parse(text)
  return data.categories ?? []
}

export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })
}