import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import { db } from "../src/db"
import { films, categories, filmCategories } from "../src/db/schema"
import { eq, count } from "drizzle-orm"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config()
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const OMDB_API_KEY = process.env.OMDB_API_KEY || process.env.OMDB_KEY || "1df456d6"

const TITLES_TO_SEED = [
    // --- SERIES ---
    "Casa de papel", "Breaking Bad", "Game of Thrones", "Stranger Things", "The Walking Dead",
    "Prison Break", "Vikings", "Peaky Blinders", "Dark", "Black Mirror",
    "The Witcher", "Squid Game", "Narcos", "The Boys", "The Mandalorian", "Loki",
    "WandaVision", "The Crown", "Friends", "The Office", "Sherlock", "Fargo",
    "True Detective", "The Wire", "Sopranos", "Better Call Saul", "Succession",
    "Chernobyl", "Band of Brothers", "Rick and Morty", "Avatar: The Last Airbender",
    "Arcane", "The Last of Us", "House of the Dragon", "Severance", "Ted Lasso",
    "Mindhunter", "Ozark", "Bojack Horseman", "Fringe", "Mr. Robot",
    "Mad Men", "Lost", "Dexter", "House M.D.", "Suits", "Supernatural",
    "The Big Bang Theory", "How I Met Your Mother", "Brooklyn Nine-Nine",

    // --- MOVIES ---
    "Inception", "Interstellar", "The Dark Knight", "Avatar", "Avengers: Endgame",
    "The Matrix", "Gladiator", "Titanic", "Jurassic Park", "Forrest Gump",
    "Star Wars: Episode IV", "Star Wars: Episode V", "Star Wars: Episode VI",
    "Harry Potter and the Sorcerer's Stone", "Harry Potter and the Chamber of Secrets",
    "Spider-Man", "Batman Begins", "Iron Man", "Joker", "Terminator 2",
    "Alien", "Aliens", "Blade Runner", "Blade Runner 2049", "The Lord of the Rings: The Fellowship of the Ring",
    "The Lord of the Rings: The Two Towers", "The Lord of the Rings: The Return of the King",
    "Mad Max: Fury Road", "Dune", "Guardians of the Galaxy", "Black Panther",
    "John Wick", "Die Hard", "Indiana Jones", "Pirates of the Caribbean",
    "The Avengers", "Thor: Ragnarok", "Captain America: The Winter Soldier",

    "Pulp Fiction", "The Shawshank Redemption", "The Godfather", "The Godfather: Part II",
    "12 Angry Men", "Schindler's List", "Fight Club", "Goodfellas", "The Silence of the Lambs",
    "Se7en", "City of God", "The Green Mile", "Parasite", "Leon: The Professional",
    "American History X", "Whiplash", "The Departed", "The Prestige", "Memento",
    "Django Unchained", "The Shining", "A Clockwork Orange", "Taxi Driver",
    "No Country for Old Men", "There Will Be Blood", "Drive", "Prisoners",
    "Zodiac", "The Wolf of Wall Street", "Shutter Island", "Catch Me If You Can",

    "Toy Story", "Finding Nemo", "Up", "WALL-E", "Inside Out", "Coco",
    "Spider-Man: Into the Spider-Verse", "Spirited Away", "The Lion King",
    "Aladdin", "Shrek", "Despicable Me", "Frozen", "Kung Fu Panda",
    "How to Train Your Dragon", "Ratatouille", "The Incredibles", "Monsters, Inc.",
    "Superbad", "The Hangover", "Step Brothers", "Dumb and Dumber", "Anchorman",
    "Shaun of the Dead", "Hot Fuzz", "Groundhog Day", "Tropic Thunder",
    "Mean Girls", "Napoleon Dynamite", "Rush Hour"
];

const GENRE_MAP: Record<string, string> = {
    "Action": "Action",
    "Adventure": "Aventure",
    "Animation": "Animation",
    "Biography": "Biographie",
    "Comedy": "Comédie",
    "Crime": "Crime",
    "Documentary": "Documentaire",
    "Drama": "Drame",
    "Family": "Familial",
    "Fantasy": "Fantastique",
    "Horror": "Horreur",
    "Mystery": "Mystère",
    "Romance": "Romance",
    "Sci-Fi": "Science-Fiction",
    "Sport": "Sport",
    "Thriller": "Thriller",
    "War": "Guerre",
    "Western": "Western"
};

async function seed() {
    const skipIfGte = Number(process.env.SEED_OMDB_SKIP_IF_COUNT ?? "100")
    const [countRow] = await db.select({ c: count() }).from(films)
    const existingTotal = Number(countRow?.c ?? 0)
    if (existingTotal >= skipIfGte) {
        console.log(
            `[seed:omdb] Déjà ${existingTotal} film(s) (seuil SEED_OMDB_SKIP_IF_COUNT=${skipIfGte}), import ignoré.`,
        )
        process.exit(0)
    }

    console.log("Démarrage de l'importation de films et séries depuis OMDb...")
    let imported = 0

    for (const title of TITLES_TO_SEED) {
        try {
            console.log(`Recherche pour: ${title}...`)
            const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
            const data: any = await res.json();

            if (data.Response === "False" || !data.imdbID) {
                console.log(`❌ Non trouvé: ${title}`)
                continue;
            }

            // check if exists
            const existing = await db
                .select()
                .from(films)
                .where(eq(films.imdbId, data.imdbID))
                .limit(1)

            if (existing.length > 0) {
                console.log(`⚠️ Déjà en base: ${title}`)
                continue;
            }

            // Insert Film
            const [newFilm] = await db.insert(films).values({
                imdbId: data.imdbID,
                title: data.Title,
                year: data.Year,
                posterUrl: data.Poster !== "N/A" ? data.Poster : null,
                synopsis: data.Plot !== "N/A" ? data.Plot : null,
                metadata: JSON.stringify(data),
            }).returning();

            await new Promise(r => setTimeout(r, 200));

            // Insert Categories
            const genreString = data.Genre || "";
            const rawGenres = genreString.split(",").map((g: string) => g.trim()).filter(Boolean);
            const mappedGenres = new Set<string>();

            // Add "Série" if it's a TV show
            if (data.Type === "series") mappedGenres.add("Série");
            if (data.Type === "movie") mappedGenres.add("Movie");

            for (const g of rawGenres) {
                if (GENRE_MAP[g]) mappedGenres.add(GENRE_MAP[g]);
                else mappedGenres.add(g);
            }

            for (const g of Array.from(mappedGenres)) {
                // Find or create category
                let cats = await db.select().from(categories).where(eq(categories.name, g));
                let cat = cats[0];

                if (!cat) {
                    const inserted = await db.insert(categories).values({ name: g }).returning();
                    cat = inserted[0];
                }

                // Link
                await db.insert(filmCategories).values({
                    filmId: newFilm.id,
                    categoryId: cat.id
                }).onConflictDoNothing();
            }

            imported++;
            console.log(`✅ Importé: ${title}`)
        } catch (e: any) {
            console.error(`Erreur sur ${title}:`, e.message);
        }
    }

    console.log(`\nImportation terminée ! Films ajoutés : ${imported}`);
    process.exit(0);
}

seed();
