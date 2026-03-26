import { eq } from "drizzle-orm"
import { db } from "../../db"
import { films } from "../../db/schema"

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export async function resolveFilmId(input: string): Promise<string | null> {
  const raw = String(input || "").trim()
  if (!raw) return null
  if (isUuid(raw)) return raw

  const byImdb = await db
    .select({ id: films.id })
    .from(films)
    .where(eq(films.imdbId, raw))
    .limit(1)

  return byImdb[0]?.id ?? null
}
