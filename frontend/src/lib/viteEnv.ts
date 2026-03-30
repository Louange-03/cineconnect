/** Lecture runtime des `VITE_*` (évite l’inlining depuis des variables d’environnement shell au build). */
export function readViteEnv(key: string): string | undefined {
  const v = (import.meta.env as Record<string, unknown>)[key]
  return typeof v === "string" ? v : undefined
}
