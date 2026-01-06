import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const history = sqliteTable("history", {
  id: integer().primaryKey({ autoIncrement: true }),
  match_id: text().notNull().unique(),
  puuid: text().notNull(),
  kills: integer().notNull().default(0),
  deaths: integer().notNull().default(0),
  assists: integer().notNull().default(0),
  is_remake: integer().notNull().default(0),
  result: integer().notNull(),
  champion_id: integer().notNull(),
  is_surrender: integer().notNull().default(0),
  duration: integer().notNull(),
  date: integer().notNull(),
  snapshot_tier: text(),
  snapshot_division: text(),
  snapshot_lp: integer(),
  snapshot_wins: integer(),
  snapshot_losses: integer(),
  season: integer().notNull().default(0)
});
