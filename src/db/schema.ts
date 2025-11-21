// src/db/schema.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const aiRequests = sqliteTable("ai_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // "explain" | "testcases" | "email"
  input: text("input").notNull(),
  output: text("output").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});
