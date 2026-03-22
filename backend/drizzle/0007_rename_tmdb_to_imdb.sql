-- Aligner la base sur le schéma OMDb : tmdb_id -> imdb_id
ALTER TABLE "films" RENAME COLUMN "tmdb_id" TO "imdb_id";
ALTER TABLE "films" RENAME CONSTRAINT "films_tmdb_id_unique" TO "films_imdb_id_unique";
