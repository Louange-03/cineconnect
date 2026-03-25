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
  lastSeen: timestamp("last_seen"),
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
})

export const favorites = pgTable("favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  filmId: uuid("film_id").notNull().references(() => films.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userFilmFavoritUniq: uniqueIndex("favorites_user_film_uniq").on(t.userId, t.filmId),
}))

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  seen: boolean("seen").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const conversationMembers = pgTable(
  "conversation_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    memberUniq: uniqueIndex("conv_member_uniq").on(t.conversationId, t.userId),
  })
)

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
  },
  (t) => ({
    tokenHashUnique: uniqueIndex("password_reset_tokens_token_hash_unique").on(t.tokenHash),
    userIdIdx: index("password_reset_tokens_user_id_idx").on(t.userId),
    expiresAtIdx: index("password_reset_tokens_expires_at_idx").on(t.expiresAt),
  })
)