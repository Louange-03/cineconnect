import { pgTable, pgEnum, uuid, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core"
import { users } from "./users"

export const friendshipStatus = pgEnum("friendship_status", ["pending", "accepted", "rejected"])

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
    uniqPair: uniqueIndex("friendships_requester_addressee_uniq").on(t.requesterId, t.addresseeId),
    requesterIdx: index("friendships_requester_idx").on(t.requesterId),
    addresseeIdx: index("friendships_addressee_idx").on(t.addresseeId),
    statusIdx: index("friendships_status_idx").on(t.status),
  })
)
