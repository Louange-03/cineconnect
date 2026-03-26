import { db } from "../src/db"
import { users } from "../src/db/schema"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
dotenv.config()

const FAKE_USERS = [
    { username: "Cinephile99", email: "cinephile99@example.com" },
    { username: "FilmGeek", email: "filmgeek@example.com" },
    { username: "NolanFan", email: "nolanfan@example.com" },
    { username: "MarvelLover", email: "marvel@example.com" },
    { username: "TarantinoBro", email: "tarantino@example.com" },
    { username: "SciFiNerd", email: "scifi@example.com" },
    { username: "HorrorQueen", email: "horror@example.com" },
    { username: "AnimeWatcher", email: "anime@example.com" },
    { username: "PopcornTime", email: "popcorn@example.com" },
    { username: "MovieCritic", email: "critic@example.com" },
];

async function seedUsers() {
    console.log("Création d'utilisateurs fictifs pour le réseau social...");
    let count = 0;
    const defaultPassword = await bcrypt.hash("password123", 10);

    for (const u of FAKE_USERS) {
        try {
            await db.insert(users).values({
                username: u.username,
                email: u.email,
                passwordHash: defaultPassword
            }).onConflictDoNothing();
            console.log(`✅ Créé: ${u.username}`);
            count++;
        } catch (e: any) {
            console.error(`Erreur sur ${u.username}:`, e.message);
        }
    }
    console.log(`Génération terminée. ${count} amis potentiels prêts !`);
    process.exit(0);
}

seedUsers();
