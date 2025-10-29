import {
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

/* ===== Auth tables (per @auth/drizzle-adapter minimal) ===== */
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Auth.js expects string id
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id").notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
  })
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  })
)

/* ===== App tables ===== */
export const visibilityEnum = pgEnum("visibility", [
  "unlisted",
  "private",
  "public",
])

export const events = pgTable("events", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  ownerId: text("owner_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  locationText: text("location_text"),
  visibility: visibilityEnum("visibility").notNull().default("unlisted"),
  shareToken: text("share_token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const comments = pgTable("comments", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  eventId: uuid("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})
