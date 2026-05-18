import type { SQLiteDatabase } from "expo-sqlite";
import type {
  ApplicationRow,
  InterviewRow,
  JobApplication,
  InterviewEvent,
} from "@/types/models";
import { rowToApplication, rowToInterview } from "@/types/models";
import type { ExportPayload } from "@/utils/exportData";
import {
  cancelFollowUpReminder,
  scheduleFollowUpReminder,
  setFollowUpRemindersEnabled,
} from "@/utils/followUpReminders";
import { newId } from "@/utils/id";

function nowIso(): string {
  return new Date().toISOString();
}

export async function listApplications(
  db: SQLiteDatabase,
  opts?: {
    status?: string;
    search?: string;
    archived?: "active" | "archived" | "all";
    statusMatches?: string[];
    sort?: "newest" | "followUpSoon" | "companyAsc";
  }
): Promise<JobApplication[]> {
  const params: (string | number)[] = [];
  let where = "WHERE 1=1";
  const archiveMode = opts?.archived ?? "active";
  if (archiveMode === "active") {
    where += " AND archived_at IS NULL";
  } else if (archiveMode === "archived") {
    where += " AND archived_at IS NOT NULL";
  }
  if (opts?.status && opts.status !== "all") {
    where += " AND status = ?";
    params.push(opts.status);
  }
  if (opts?.search?.trim()) {
    const statusPlaceholders = opts.statusMatches?.length
      ? ` OR status IN (${opts.statusMatches.map(() => "?").join(",")})`
      : "";
    where += ` AND (
      company LIKE ? OR role LIKE ? OR IFNULL(notes,'') LIKE ? OR IFNULL(location,'') LIKE ?
      OR IFNULL(job_url,'') LIKE ? OR IFNULL(salary_note,'') LIKE ? OR status LIKE ?${statusPlaceholders}
    )`;
    const q = `%${opts.search.trim()}%`;
    params.push(q, q, q, q, q, q, q);
    if (opts.statusMatches?.length) params.push(...opts.statusMatches);
  }
  const orderBy =
    opts?.sort === "followUpSoon"
      ? "CASE WHEN next_follow_up_at IS NULL THEN 1 ELSE 0 END, datetime(next_follow_up_at) ASC, datetime(updated_at) DESC"
      : opts?.sort === "companyAsc"
        ? "company COLLATE NOCASE ASC, role COLLATE NOCASE ASC"
        : "datetime(updated_at) DESC";
  const rows = await db.getAllAsync<ApplicationRow>(
    `SELECT * FROM applications ${where} ORDER BY ${orderBy}`,
    ...params
  );
  return rows.map(rowToApplication);
}

export async function getApplication(
  db: SQLiteDatabase,
  id: string
): Promise<JobApplication | null> {
  const row = await db.getFirstAsync<ApplicationRow>(
    "SELECT * FROM applications WHERE id = ?",
    id
  );
  return row ? rowToApplication(row) : null;
}

export async function insertApplication(
  db: SQLiteDatabase,
  input: Omit<JobApplication, "createdAt" | "updatedAt" | "id" | "followUpNotificationId" | "archivedAt"> & {
    id?: string;
    archivedAt?: string | null;
  }
): Promise<JobApplication> {
  const id = input.id ?? newId();
  const ts = nowIso();
  const notificationId = await scheduleFollowUpReminder(input);
  await db.runAsync(
    `INSERT INTO applications (
      id, company, role, status, applied_at, location, job_url, salary_note, notes, next_follow_up_at, follow_up_notification_id, archived_at, created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    id,
    input.company.trim(),
    input.role.trim(),
    input.status,
    input.appliedAt,
    input.location,
    input.jobUrl,
    input.salaryNote,
    input.notes,
    input.nextFollowUpAt,
    notificationId,
    input.archivedAt ?? null,
    ts,
    ts
  );
  const created = await getApplication(db, id);
  if (!created) throw new Error("Insert failed: record not found after write");
  return created;
}

export async function updateApplication(
  db: SQLiteDatabase,
  id: string,
  patch: Partial<Omit<JobApplication, "id" | "createdAt">>
): Promise<JobApplication | null> {
  const existing = await getApplication(db, id);
  if (!existing) return null;
  const next: JobApplication = {
    ...existing,
    ...patch,
    id,
    createdAt: existing.createdAt,
    updatedAt: nowIso(),
  };
  await cancelFollowUpReminder(existing.followUpNotificationId);
  const notificationId = next.archivedAt ? null : await scheduleFollowUpReminder(next);
  next.followUpNotificationId = notificationId;
  await db.runAsync(
    `UPDATE applications SET
      company = ?, role = ?, status = ?, applied_at = ?, location = ?, job_url = ?, salary_note = ?, notes = ?, next_follow_up_at = ?, follow_up_notification_id = ?, archived_at = ?, updated_at = ?
    WHERE id = ?`,
    next.company.trim(),
    next.role.trim(),
    next.status,
    next.appliedAt,
    next.location,
    next.jobUrl,
    next.salaryNote,
    next.notes,
    next.nextFollowUpAt,
    next.followUpNotificationId,
    next.archivedAt,
    next.updatedAt,
    id
  );
  return getApplication(db, id);
}

export async function deleteApplication(db: SQLiteDatabase, id: string): Promise<boolean> {
  const existing = await getApplication(db, id);
  await cancelFollowUpReminder(existing?.followUpNotificationId);
  const res = await db.runAsync("DELETE FROM applications WHERE id = ?", id);
  return res.changes > 0;
}

export async function setApplicationArchived(
  db: SQLiteDatabase,
  id: string,
  archived: boolean
): Promise<JobApplication | null> {
  const existing = await getApplication(db, id);
  if (!existing) return null;
  await cancelFollowUpReminder(existing.followUpNotificationId);
  const archivedAt = archived ? nowIso() : null;
  const notificationId = archived ? null : await scheduleFollowUpReminder(existing);
  await db.runAsync(
    "UPDATE applications SET archived_at = ?, follow_up_notification_id = ?, updated_at = ? WHERE id = ?",
    archivedAt,
    notificationId,
    nowIso(),
    id
  );
  return getApplication(db, id);
}

export async function listInterviewsForApplication(
  db: SQLiteDatabase,
  applicationId: string
): Promise<InterviewEvent[]> {
  const rows = await db.getAllAsync<InterviewRow>(
    "SELECT * FROM interviews WHERE application_id = ? ORDER BY datetime(created_at) DESC",
    applicationId
  );
  return rows.map(rowToInterview);
}

export async function insertInterview(
  db: SQLiteDatabase,
  applicationId: string,
  input: { title: string; scheduledAt: string | null; notes: string | null }
): Promise<InterviewEvent> {
  const id = newId();
  const ts = nowIso();
  await db.runAsync(
    `INSERT INTO interviews (id, application_id, title, scheduled_at, notes, created_at) VALUES (?,?,?,?,?,?)`,
    id,
    applicationId,
    input.title.trim(),
    input.scheduledAt,
    input.notes,
    ts
  );
  const row = await db.getFirstAsync<InterviewRow>("SELECT * FROM interviews WHERE id = ?", id);
  if (!row) throw new Error("Interview insert failed");
  return rowToInterview(row);
}

export async function updateInterview(
  db: SQLiteDatabase,
  id: string,
  input: { title: string; scheduledAt: string | null; notes: string | null }
): Promise<InterviewEvent | null> {
  await db.runAsync(
    "UPDATE interviews SET title = ?, scheduled_at = ?, notes = ? WHERE id = ?",
    input.title.trim(),
    input.scheduledAt,
    input.notes,
    id
  );
  const row = await db.getFirstAsync<InterviewRow>("SELECT * FROM interviews WHERE id = ?", id);
  return row ? rowToInterview(row) : null;
}

export async function deleteInterview(db: SQLiteDatabase, id: string): Promise<boolean> {
  const res = await db.runAsync("DELETE FROM interviews WHERE id = ?", id);
  return res.changes > 0;
}

export async function listAllInterviews(db: SQLiteDatabase): Promise<InterviewEvent[]> {
  const rows = await db.getAllAsync<InterviewRow>(
    "SELECT * FROM interviews ORDER BY datetime(created_at) DESC"
  );
  return rows.map(rowToInterview);
}

export async function replaceAllData(db: SQLiteDatabase, payload: ExportPayload): Promise<void> {
  const existingRows = await db.getAllAsync<{ follow_up_notification_id: string | null }>(
    "SELECT follow_up_notification_id FROM applications WHERE follow_up_notification_id IS NOT NULL"
  );
  for (const row of existingRows) {
    await cancelFollowUpReminder(row.follow_up_notification_id);
  }

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync("DELETE FROM interviews");
    await txn.runAsync("DELETE FROM applications");

    for (const app of payload.applications) {
      await txn.runAsync(
        `INSERT INTO applications (
          id, company, role, status, applied_at, location, job_url, salary_note, notes, next_follow_up_at, follow_up_notification_id, archived_at, created_at, updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        app.id,
        app.company.trim(),
        app.role.trim(),
        app.status,
        app.appliedAt,
        app.location,
        app.jobUrl,
        app.salaryNote,
        app.notes,
        app.nextFollowUpAt,
        null,
        app.archivedAt ?? null,
        app.createdAt,
        app.updatedAt
      );
    }

    for (const interview of payload.interviews) {
      await txn.runAsync(
        "INSERT INTO interviews (id, application_id, title, scheduled_at, notes, created_at) VALUES (?,?,?,?,?,?)",
        interview.id,
        interview.applicationId,
        interview.title.trim(),
        interview.scheduledAt,
        interview.notes,
        interview.createdAt
      );
    }
  });

  for (const app of payload.applications) {
    if (app.archivedAt) continue;
    const notificationId = await scheduleFollowUpReminder(app);
    if (notificationId) {
      await db.runAsync(
        "UPDATE applications SET follow_up_notification_id = ? WHERE id = ?",
        notificationId,
        app.id
      );
    }
  }
}

export async function refreshFollowUpReminders(
  db: SQLiteDatabase,
  enabled: boolean
): Promise<void> {
  await setFollowUpRemindersEnabled(enabled);
  const apps = await listApplications(db, { archived: "active" });

  for (const app of apps) {
    await cancelFollowUpReminder(app.followUpNotificationId);
    await db.runAsync("UPDATE applications SET follow_up_notification_id = ? WHERE id = ?", null, app.id);
  }

  if (!enabled) return;

  for (const app of apps) {
    const notificationId = await scheduleFollowUpReminder(app);
    if (notificationId) {
      await db.runAsync(
        "UPDATE applications SET follow_up_notification_id = ? WHERE id = ?",
        notificationId,
        app.id
      );
    }
  }
}

export async function countByStatus(
  db: SQLiteDatabase
): Promise<Record<string, number>> {
  const rows = await db.getAllAsync<{ status: string; c: number }>(
    "SELECT status, COUNT(*) as c FROM applications WHERE archived_at IS NULL GROUP BY status"
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.status] = r.c;
  return out;
}
