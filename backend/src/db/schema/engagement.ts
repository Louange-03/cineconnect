import { pgTable, uuid, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { users } from "./users.js"
import { films } from "./catalog.js"

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  filmId: uuid("film_id").notNull().references(() => films.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    filmId: uuid("film_id").notNull().references(() => films.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userFilmFavoritUniq: uniqueIndex("favorites_user_film_uniq").on(t.userId, t.filmId),
  })
)
