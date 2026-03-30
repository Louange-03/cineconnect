import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import { eq } from "drizzle-orm"
import { db } from "../src/db"
import { films, categories, filmCategories } from "../src/db/schema"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, "../.env") })

/** Quelques films de démo si la table est vide (aucune clé API requise). */
const DEMO = [
  {
    imdbId: "tt0133093",
    title: "The Matrix",
    year: "1999",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc5L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    synopsis: "Un pirate informatique découvre la nature de la réalité.",
    cats: ["Science-Fiction", "Action"],
  },
  {
    imdbId: "tt0468569",
    title: "The Dark Knight",
    year: "2008",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
    synopsis: "Batman affronte le Joker à Gotham.",
    cats: ["Action", "Crime", "Drame"],
  },
  {
    imdbId: "tt0111161",
    title: "The Shawshank Redemption",
    year: "1994",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNDE3OTcxMTYzM15BMl5BanBnXkFtZTgwNTgzMTNzNzM@._V1_SX300.jpg",
    synopsis: "Deux hommes liés par l'espoir en prison.",
    cats: ["Drame"],
  },
  {
    imdbId: "tt1375666",
    title: "Inception",
    year: "2010",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    synopsis: "Voler des secrets dans les rêves.",
    cats: ["Action", "Science-Fiction", "Thriller"],
  },
  {
    imdbId: "tt0109830",
    title: "Forrest Gump",
    year: "1994",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    synopsis: "Le parcours d'un homme simple à travers les États-Unis.",
    cats: ["Drame", "Romance"],
  },
]

async function getOrCreateCategory(name: string) {
  const found = await db.select().from(categories).where(eq(categories.name, name)).limit(1)
  if (found[0]) return found[0].id
  const [inserted] = await db.insert(categories).values({ name }).returning({ id: categories.id })
  return inserted.id
}

async function main() {
  const any = await db.select({ id: films.id }).from(films).limit(1)
  if (any.length > 0) {
    console.log("[seed:demo] Films déjà présents — aucun insert.")
    process.exit(0)
  }

  let n = 0
  for (const row of DEMO) {
    const [film] = await db
      .insert(films)
      .values({
        imdbId: row.imdbId,
        title: row.title,
        year: row.year,
        posterUrl: row.posterUrl,
        synopsis: row.synopsis,
        metadata: null,
      })
      .returning({ id: films.id })

    for (const catName of row.cats) {
      const categoryId = await getOrCreateCategory(catName)
      await db
        .insert(filmCategories)
        .values({ filmId: film.id, categoryId })
        .onConflictDoNothing()
    }
    n++
    console.log(`[seed:demo] OK ${row.title}`)
  }

  console.log(`[seed:demo] Terminé — ${n} film(s).`)
  process.exit(0)
}

main().catch((e) => {
  console.error("[seed:demo]", e)
  process.exit(1)
})
