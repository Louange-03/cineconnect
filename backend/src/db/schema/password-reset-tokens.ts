import { pgTable, uuid, varchar, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core"
import { users } from "./users.js"

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
