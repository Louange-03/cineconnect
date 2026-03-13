import { db } from "../src/db"
import { films, categories, filmCategories } from "../src/db/schema"
import { eq } from "drizzle-orm"
import dotenv from "dotenv"
dotenv.config()

const OMDB_API_KEY = process.env.OMDB_API_KEY || "e4cdbd66" // fallback demo key

const GENRE_MAP: Record<string, string> = {
    "Action": "Action", "Adventure": "Aventure", "Animation": "Animation",
    "Biography": "Biographie", "Comedy": "Comédie", "Crime": "Crime",
    "Documentary": "Documentaire", "Drama": "Drame", "Family": "Familial",
    "Fantasy": "Fantastique", "Horror": "Horreur", "Mystery": "Mystère",
    "Romance": "Romance", "Sci-Fi": "Science-Fiction", "Sport": "Sport",
    "Thriller": "Thriller", "War": "Guerre", "Western": "Western"
};

const SEARCH_TERMS = [
    "love", "world", "day", "man", "star", "night", "city", "american",
    "life", "girl", "boy", "dark", "blood", "black", "white", "alien",
    "game", "house", "blood", "magic", "king", "queen", "war", "dog"
];

const MAX_PAGES_PER_TERM = 3; // 30 results per term

async function seedMassive() {
    console.log("Démarrage de l'importation MASSIVE depuis OMDb...")
    let imported = 0;
    let limitReached = false;

    for (const term of SEARCH_TERMS) {
        if (limitReached) break;

        console.log(`\nRecherche du mot-clé: "${term}"`)

        for (let page = 1; page <= MAX_PAGES_PER_TERM; page++) {
            if (limitReached) break;

            try {
                const searchRes = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(term)}&page=${page}&apikey=${OMDB_API_KEY}`);
                const searchData = await searchRes.json();

                if (searchData.Response === "False") {
                    if (searchData.Error?.includes("limit")) {
                        limitReached = true;
                        console.log("❌ Limite d'API OMDb atteinte.");
                        break;
                    }
                    if (searchData.Error === "Movie not found!") {
                        break; // No more pages
                    }
                    continue;
                }

                const results = searchData.Search || [];

                for (const item of results) {
                    if (limitReached) break;

                    const imdbID = item.imdbID;

                    // check DB
                    const existing = await db.select().from(films).where(eq(films.tmdbId, imdbID)).limit(1);
                    if (existing.length > 0) {
                        continue; // Already saved
                    }

                    // fetch details
                    const detailRes = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`);
                    const data = await detailRes.json();

                    if (data.Response === "False") {
                        if (data.Error?.includes("limit")) limitReached = true;
                        continue;
                    }

                    // Insert Film
                    const [newFilm] = await db.insert(films).values({
                        tmdbId: data.imdbID,
                        title: data.Title,
                        year: data.Year,
                        posterUrl: data.Poster !== "N/A" ? data.Poster : null,
                        synopsis: data.Plot !== "N/A" ? data.Plot : null,
                        metadata: JSON.stringify(data),
                    }).returning();

                    // Insert Categories
                    const genreString = data.Genre || "";
                    const rawGenres = genreString.split(",").map((g: string) => g.trim()).filter(Boolean);
                    const mappedGenres = new Set<string>();

                    if (data.Type === "series") mappedGenres.add("Série");
                    if (data.Type === "movie") mappedGenres.add("Movie");

                    for (const g of rawGenres) {
                        if (GENRE_MAP[g]) mappedGenres.add(GENRE_MAP[g]);
                        else mappedGenres.add(g);
                    }

                    for (const g of Array.from(mappedGenres)) {
                        let cats = await db.select().from(categories).where(eq(categories.name, g));
                        let cat = cats[0];
                        if (!cat) {
                            const inserted = await db.insert(categories).values({ name: g }).returning();
                            cat = inserted[0];
                        }
                        await db.insert(filmCategories).values({
                            filmId: newFilm.id,
                            categoryId: cat.id
                        }).onConflictDoNothing();
                    }

                    imported++;
                    console.log(`✅ Importé: ${data.Title} (${data.Year})`)

                    // Respect API somewhat
                    await new Promise(r => setTimeout(r, 100));
                }
            } catch (e: any) {
                console.error(`Erreur réseau:`, e.message);
            }
        }
    }

    console.log(`\n--- IMPORTATION TERMINÉE ---`);
    console.log(`Total de nouveaux titres ajoutés : ${imported}`);
    process.exit(0);
}

seedMassive();
