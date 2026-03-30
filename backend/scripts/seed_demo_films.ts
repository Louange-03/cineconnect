import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import { eq } from "drizzle-orm"
import { db } from "../src/db"
import { films, categories, filmCategories } from "../src/db/schema"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, "../.env") })

/**
 * Titres embarqués sans OMDb (affiches optionnelles).
 * Fusion : on n’insère que les `imdbId` absents — safe à chaque démarrage.
 */
const DEMO = [
  {
    imdbId: "tt0133093",
    title: "The Matrix",
    year: "1999",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc5L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    synopsis: "Un pirate informatique découvre la nature de la réalité.",
    cats: ["Science-Fiction", "Action", "Movie"],
  },
  {
    imdbId: "tt0468569",
    title: "The Dark Knight",
    year: "2008",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
    synopsis: "Batman affronte le Joker à Gotham.",
    cats: ["Action", "Crime", "Drame", "Movie"],
  },
  {
    imdbId: "tt0111161",
    title: "The Shawshank Redemption",
    year: "1994",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNDE3OTcxMTYzM15BMl5BanBnXkFtZTgwNTgzMTNzNzM@._V1_SX300.jpg",
    synopsis: "Deux hommes liés par l'espoir en prison.",
    cats: ["Drame", "Movie"],
  },
  {
    imdbId: "tt1375666",
    title: "Inception",
    year: "2010",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    synopsis: "Voler des secrets dans les rêves.",
    cats: ["Action", "Science-Fiction", "Thriller", "Movie"],
  },
  {
    imdbId: "tt0109830",
    title: "Forrest Gump",
    year: "1994",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    synopsis: "Le parcours d'un homme simple à travers les États-Unis.",
    cats: ["Drame", "Romance", "Movie"],
  },
  {
    imdbId: "tt0110912",
    title: "Pulp Fiction",
    year: "1994",
    posterUrl: null,
    synopsis: "Los Angeles, des personnages entremêlés.",
    cats: ["Crime", "Drame", "Movie"],
  },
  {
    imdbId: "tt0068646",
    title: "The Godfather",
    year: "1972",
    posterUrl: null,
    synopsis: "La famille Corleone.",
    cats: ["Crime", "Drame", "Movie"],
  },
  {
    imdbId: "tt0816692",
    title: "Interstellar",
    year: "2014",
    posterUrl: null,
    synopsis: "Exploration spatiale pour sauver l’humanité.",
    cats: ["Aventure", "Drame", "Science-Fiction", "Movie"],
  },
  {
    imdbId: "tt4154756",
    title: "Avengers: Endgame",
    year: "2019",
    posterUrl: null,
    synopsis: "Les Avengers affrontent Thanos.",
    cats: ["Action", "Aventure", "Drame", "Movie"],
  },
  {
    imdbId: "tt0848228",
    title: "The Avengers",
    year: "2012",
    posterUrl: null,
    synopsis: "Les héros Marvel unissent leurs forces.",
    cats: ["Action", "Science-Fiction", "Movie"],
  },
  {
    imdbId: "tt1825683",
    title: "Black Panther",
    year: "2018",
    posterUrl: null,
    synopsis: "T’Challa et le Wakanda.",
    cats: ["Action", "Aventure", "Drame", "Movie"],
  },
  {
    imdbId: "tt3501632",
    title: "Thor: Ragnarok",
    year: "2017",
    posterUrl: null,
    synopsis: "Thor sur la planète Sakaar.",
    cats: ["Action", "Aventure", "Comédie", "Movie"],
  },
  {
    imdbId: "tt0372784",
    title: "Batman Begins",
    year: "2005",
    posterUrl: null,
    synopsis: "Les origines de Batman.",
    cats: ["Action", "Crime", "Drame", "Movie"],
  },
  {
    imdbId: "tt0371746",
    title: "Iron Man",
    year: "2008",
    posterUrl: null,
    synopsis: "Tony Stark devient Iron Man.",
    cats: ["Action", "Science-Fiction", "Movie"],
  },
  {
    imdbId: "tt0113277",
    title: "Se7en",
    year: "1995",
    posterUrl: null,
    synopsis: "Deux détectives et un tueur aux sept péchés capitaux.",
    cats: ["Crime", "Drame", "Mystère", "Movie"],
  },
  {
    imdbId: "tt0102926",
    title: "The Silence of the Lambs",
    year: "1991",
    posterUrl: null,
    synopsis: "Clarice Starling et Hannibal Lecter.",
    cats: ["Crime", "Drame", "Thriller", "Movie"],
  },
  {
    imdbId: "tt1130884",
    title: "Shutter Island",
    year: "2010",
    posterUrl: null,
    synopsis: "Un marshal enquête dans un hôpital psychiatrique.",
    cats: ["Mystère", "Thriller", "Movie"],
  },
  {
    imdbId: "tt7286456",
    title: "Joker",
    year: "2019",
    posterUrl: null,
    synopsis: "Arthur Fleck à Gotham.",
    cats: ["Crime", "Drame", "Thriller", "Movie"],
  },
  {
    imdbId: "tt2911666",
    title: "John Wick",
    year: "2014",
    posterUrl: null,
    synopsis: "Un ancien tueur à gages sort de sa retraite.",
    cats: ["Action", "Crime", "Thriller", "Movie"],
  },
  {
    imdbId: "tt0167260",
    title: "The Lord of the Rings: The Fellowship of the Ring",
    year: "2001",
    posterUrl: null,
    synopsis: "La communauté de l’anneau.",
    cats: ["Aventure", "Drame", "Fantastique", "Movie"],
  },
  {
    imdbId: "tt0120737",
    title: "The Lord of the Rings: The Two Towers",
    year: "2002",
    posterUrl: null,
    synopsis: "La guerre pour la Terre du Milieu continue.",
    cats: ["Aventure", "Drame", "Fantastique", "Movie"],
  },
  {
    imdbId: "tt0167261",
    title: "The Lord of the Rings: The Return of the King",
    year: "2003",
    posterUrl: null,
    synopsis: "La bataille finale pour le Mordor.",
    cats: ["Aventure", "Drame", "Fantastique", "Movie"],
  },
]

async function getOrCreateCategory(name: string) {
  const found = await db.select().from(categories).where(eq(categories.name, name)).limit(1)
  if (found[0]) return found[0].id
  const [inserted] = await db.insert(categories).values({ name }).returning({ id: categories.id })
  return inserted.id
}

async function main() {
  let inserted = 0
  for (const row of DEMO) {
    const exists = await db.select({ id: films.id }).from(films).where(eq(films.imdbId, row.imdbId)).limit(1)
    if (exists.length > 0) continue

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
    inserted++
    console.log(`[seed:demo] OK ${row.title}`)
  }

  if (inserted === 0) {
    console.log("[seed:demo] Aucun nouveau titre (déjà en base).")
  } else {
    console.log(`[seed:demo] Terminé — ${inserted} nouveau(x) film(s).`)
  }
  process.exit(0)
}

main().catch((e) => {
  console.error("[seed:demo]", e)
  process.exit(1)
})
