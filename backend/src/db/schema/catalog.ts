import { pgTable, uuid, varchar, timestamp, text, uniqueIndex } from "drizzle-orm/pg-core"

export const films = pgTable("films", {
  id: uuid("id").defaultRandom().primaryKey(),
  imdbId: varchar("imdb_id", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  year: varchar("year", { length: 10 }),
  posterUrl: varchar("poster_url", { length: 500 }),
  synopsis: text("synopsis"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const filmCategories = pgTable(
  "film_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    filmId: uuid("film_id").notNull().references(() => films.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    filmCategoryUnique: uniqueIndex("film_categories_film_category_unique").on(t.filmId, t.categoryId),
  })
)
