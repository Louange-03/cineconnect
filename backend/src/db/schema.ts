import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  timestamp,
  uniqueIndex,
  index,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 30 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),//optionel
})

export const friendshipStatus = pgEnum("friendship_status", [
  "pending",
  "accepted",
  "rejected",
])

export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: uuid("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqPair: uniqueIndex("friendships_requester_addressee_uniq").on(
      t.requesterId,
      t.addresseeId
    ),
    requesterIdx: index("friendships_requester_idx").on(t.requesterId),
    addresseeIdx: index("friendships_addressee_idx").on(t.addresseeId),
    statusIdx: index("friendships_status_idx").on(t.status),
  })
)

export const films = pgTable("films", {
  id: uuid("id").defaultRandom().primaryKey(),
  tmdbId: varchar("tmdb_id", { length: 50 }).notNull().unique(),
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

export const filmCategories = pgTable("film_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  filmId: uuid("film_id").notNull().references(() => films.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  filmCategoryUnique: uniqueIndex("film_categories_film_category_unique").on(t.filmId, t.categoryId),
}))

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  filmId: uuid("film_id").notNull().references(() => films.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  userFilmUnique: uniqueIndex("reviews_user_film_unique").on(t.userId, t.filmId),
}))

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: uuid("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
//