import type { SQLiteDatabase } from "expo-sqlite";

const MIGRATIONS: string[] = [
  // v1 — core tables
  `CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    applied_at TEXT,
    location TEXT,
    job_url TEXT,
    salary_note TEXT,
    notes TEXT,
    next_follow_up_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
  CREATE INDEX IF NOT EXISTS idx_applications_updated ON applications(updated_at DESC);
  CREATE TABLE IF NOT EXISTS interviews (
    id TEXT PRIMARY KEY NOT NULL,
    application_id TEXT NOT NULL,
    title TEXT NOT NULL,
    scheduled_at TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_interviews_app ON interviews(application_id);`,
];

async function ensureColumn(
  db: SQLiteDatabase,
  table: string,
  column: string,
  definition: string
): Promise<void> {
  const rows = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  if (!rows.some((row) => row.name === column)) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${definition};`);
  }
}

/**
 * Runs idempotent migrations. Keep statements backward-compatible.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA foreign_keys = ON;");
  for (const sql of MIGRATIONS) {
    await db.execAsync(sql);
  }
  await ensureColumn(db, "applications", "archived_at", "archived_at TEXT");
  await ensureColumn(
    db,
    "applications",
    "follow_up_notification_id",
    "follow_up_notification_id TEXT"
  );
  await db.runAsync("UPDATE applications SET status = ? WHERE status = ?", "accepted", "draft");
  await db.execAsync("CREATE INDEX IF NOT EXISTS idx_applications_archived ON applications(archived_at);");
}
