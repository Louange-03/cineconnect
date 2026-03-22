/**
 * URLs TMDB / Unsplash (pas d’Amazon — hotlink souvent bloqué).
 */

/** Fond hero : salle de cinéma (spectateurs / projection) — Unsplash */
export const CINEMA_BG_PRIMARY =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2560&q=85"

/** Carrousel sous le titre : affiches dessins animés / animation uniquement (TMDB) */
export const HERO_POSTERS: { src: string; alt: string; seed: string }[] = [
  {
    src: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrP6K7sem4.jpg",
    alt: "Toy Story",
    seed: "cc-hero-toystory",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/jTswp6z30wROPIOjQI1QodB8S9.jpg",
    alt: "Luca",
    seed: "cc-hero-luca",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/lRhe0pybdaHRg6kuGDltfFcYe1Q.jpg",
    alt: "Vice-Versa",
    seed: "cc-hero-insideout",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/tvYJmUv6qFDOLwZA0sUHJlMJPH5.jpg",
    alt: "La Reine des neiges",
    seed: "cc-hero-frozen",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/hlK0f0rAQvf6quCgP8zmWefnhAr.jpg",
    alt: "Zootopie",
    seed: "cc-hero-zootopia",
  },
]

export const MONSTERS_BACKDROP =
  "https://image.tmdb.org/t/p/w1920/xDcue2J1gMkWZR6UMQfH3f47T3.jpg"

/** Affiche « vrai film » (live-action), colonne droite — grande vignette */
export const MONSTERS_FOREGROUND =
  "https://image.tmdb.org/t/p/w780/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"

export const ROW_TOP_SERIES: { src: string; alt: string; seed: string }[] = [
  {
    src: "https://image.tmdb.org/t/p/w342/hm58JwzMvOm4y9F2K3rfxOJ5l1.jpg",
    alt: "Soul",
    seed: "cc-soul",
  },
  {
    src: "https://image.tmdb.org/t/p/w342/wW2apJkYOg6diuh2XwfIQJXF14y.jpg",
    alt: "Kung Fu Panda",
    seed: "cc-kfp",
  },
  {
    src: "https://image.tmdb.org/t/p/w342/iiXEOCDT6NnCKdERAdS31xYF3aL.jpg",
    alt: "Spider-Man: Into the Spider-Verse",
    seed: "cc-spiderverse",
  },
  {
    src: "https://image.tmdb.org/t/p/w342/a4qOsCcZh7y9rMACw2j9iB0drDb.jpg",
    alt: "Turbo",
    seed: "cc-turbo",
  },
]

/** Rangée « Top Films » : films réels (live-action), affiches TMDB */
export const ROW_TOP_FILMS: { src: string; alt: string; seed: string }[] = [
  {
    src: "https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911rto8a59ffViO.jpg",
    alt: "The Dark Knight",
    seed: "cc-tdk",
  },
  {
    src: "https://image.tmdb.org/t/p/w342/gEU1QvB4tMa3XcPpW0iWjAtnpFC.jpg",
    alt: "Interstellar",
    seed: "cc-interstellar",
  },
  {
    src: "https://image.tmdb.org/t/p/w342/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    alt: "Dune",
    seed: "cc-dune",
  },
  {
    src: "https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXCbny.jpg",
    alt: "Matrix",
    seed: "cc-matrix",
  },
]
