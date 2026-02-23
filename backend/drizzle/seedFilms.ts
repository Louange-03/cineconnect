// Script de seed pour films et catégories
// À compléter avec 50+ films et catégories

import { db } from '../src/db/client'
import { films, categories, filmCategories } from '../src/db/schema'

async function seed() {
  // Exemples de catégories
  const catData = [
    { name: 'Action' },
    { name: 'Comédie' },
    { name: 'Drame' },
    { name: 'Science-fiction' },
    { name: 'Animation' },
    { name: 'Horreur' },
    { name: 'Documentaire' },
    { name: 'Romance' },
    { name: 'Aventure' },
    { name: 'Thriller' }
  ]
  const cats = await Promise.all(catData.map(c => db.insert(categories).values(c).returning()))

  // Exemples de films (à compléter)
  const filmData = [
    {
      tmdbId: '1',
      title: 'Inception',
      year: '2010',
      posterUrl: 'https://image.tmdb.org/t/p/original/inception.jpg',
      synopsis: 'Un voleur utilise la technologie pour infiltrer les rêves.',
      metadata: '{}'
    },
    {
      tmdbId: '2',
      title: 'Le Roi Lion',
      year: '1994',
      posterUrl: 'https://image.tmdb.org/t/p/original/lionking.jpg',
      synopsis: 'Un lionceau doit reprendre sa place dans la savane.',
      metadata: '{}'
    }
    // ... ajouter 48+ films
  ]
  const filmsInserted = await Promise.all(filmData.map(f => db.insert(films).values(f).returning()))

  // Exemple d'association film-catégorie
  await db.insert(filmCategories).values({
    filmId: filmsInserted[0][0].id,
    categoryId: cats[3][0].id // Science-fiction
  })
  await db.insert(filmCategories).values({
    filmId: filmsInserted[1][0].id,
    categoryId: cats[4][0].id // Animation
  })

  console.log('Seed terminé')
}

seed().then(() => process.exit(0))
