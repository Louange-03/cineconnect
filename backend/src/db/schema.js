import { pgTable, serial, varchar, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    username: varchar("username", { length: 50 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_unique").on(t.email),
    usernameIdx: uniqueIndex("users_username_unique").on(t.username),
  })
)
