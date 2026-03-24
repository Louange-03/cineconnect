/**
 * URLs TMDB / Unsplash (pas d’Amazon — hotlink souvent bloqué).
 */

/** Fond hero : salle de cinéma (spectateurs / projection) — Unsplash */
export const CINEMA_BG_PRIMARY =
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=2400&q=80"

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
    src: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrP6K7sem4.jpg",
    alt: "Toy Story",
    seed: "cc-top-series-toystory",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/jTswp6z30wROPIOjQI1QodB8S9.jpg",
    alt: "Luca",
    seed: "cc-top-series-luca",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/tvYJmUv6qFDOLwZA0sUHJlMJPH5.jpg",
    alt: "La Reine des neiges",
    seed: "cc-top-series-frozen",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/iiXEOCDT6NnCKdERAdS31xYF3aL.jpg",
    alt: "Spider-Man: Into the Spider-Verse",
    seed: "cc-top-series-spiderverse",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/a4qOsCcZh7y9rMACw2j9iB0drDb.jpg",
    alt: "Turbo",
    seed: "cc-top-series-turbo",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/wW2apJkYOg6diuh2XwfIQJXF14y.jpg",
    alt: "Kung Fu Panda",
    seed: "cc-top-series-kfp",
  },
]

/** Rangée « Top Films » : films réels (live-action), affiches TMDB */
export const ROW_TOP_FILMS: { src: string; alt: string; seed: string }[] = [
  {
    src: "https://image.tmdb.org/t/p/w500/lRhe0pybdaHRg6kuGDltfFcYe1Q.jpg",
    alt: "Vice-Versa",
    seed: "cc-top-films-insideout",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/hlK0f0rAQvf6quCgP8zmWefnhAr.jpg",
    alt: "Zootopie",
    seed: "cc-top-films-zootopia",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/hm58JwzMvOm4y9F2K3rfxOJ5l1.jpg",
    alt: "Soul",
    seed: "cc-top-films-soul",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/wW2apJkYOg6diuh2XwfIQJXF14y.jpg",
    alt: "Kung Fu Panda",
    seed: "cc-top-films-kfp",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/iiXEOCDT6NnCKdERAdS31xYF3aL.jpg",
    alt: "Spider-Man: Into the Spider-Verse",
    seed: "cc-top-films-spiderverse",
  },
  {
    src: "https://image.tmdb.org/t/p/w500/a4qOsCcZh7y9rMACw2j9iB0drDb.jpg",
    alt: "Turbo",
    seed: "cc-top-films-turbo",
  },
]
