import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

let singleton: SQLite.SQLiteDatabase | null = null;

/**
 * Opens a single app database (WAL-friendly) and applies migrations.
 */
export async function openAppDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (singleton) {
    return singleton;
  }
  const db = await SQLite.openDatabaseAsync("jobapply.db");
  await runMigrations(db);
  singleton = db;
  return db;
}

export function resetDatabaseSingletonForTests(): void {
  singleton = null;
}
