import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  image: text("image"),
  created_at: timestamp("created_at").defaultNow(),
});

export const bots = pgTable("bots", {
  id: serial("id").primaryKey(),
  owner_id: varchar("owner_id", { length: 100 }).references(() => users.id),
  display_name: varchar("display_name", { length: 255 }).notNull(),
  discord_bot_id: varchar("discord_bot_id", { length: 50 }).notNull(),
  expires_at: timestamp("expires_at"),
  status: varchar("status", { length: 50 }).default("active"),
  created_at: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  transaction_id: varchar("transaction_id", { length: 255 }).notNull(),
  user_id: varchar("user_id", { length: 100 }).references(() => users.id),
  amount_cents: integer("amount_cents").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  pix_code: text("pix_code"),
  created_at: timestamp("created_at").defaultNow(),
});
