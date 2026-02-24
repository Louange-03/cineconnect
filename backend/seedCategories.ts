import { db } from "./src/db/client";
import { categories } from "./src/db/schema";

async function seedCategories() {
  const names = [
    "Action",
    "Drame",
    "Comédie",
    "Science-Fiction",
    "Thriller",
    "Horreur",
    "Animation",
    "Romance"
  ];

  for (const name of names) {
    await db.insert(categories).values({ name });
    console.log(`Catégorie ajoutée : ${name}`);
  }

  await db.end();
}

seedCategories().catch(console.error);