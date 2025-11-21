// src/db/client.ts
import "server-only";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Singleton DB, prevent open multi connection
const sqlite = new Database("sqlite/dev-qa-copilot.db", {
  fileMustExist: false,
});

export const db = drizzle(sqlite, { schema });
