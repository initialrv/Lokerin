import { File } from "expo-file-system";
import { Platform } from "react-native";
import { STATUS_ORDER } from "@/constants/statuses";
import type { ExportPayload } from "@/utils/exportData";

const statuses = new Set<string>(STATUS_ORDER);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isValidDateValue(value: string | null): boolean {
  if (value === null || value.trim() === "") return true;
  return !Number.isNaN(new Date(value).getTime());
}

function expectString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid or missing ${field}.`);
  }
  return value;
}

function parsePayload(raw: unknown): ExportPayload {
  if (!isRecord(raw) || raw.version !== 1 || !Array.isArray(raw.applications) || !Array.isArray(raw.interviews)) {
    throw new Error("This file is not a valid Lokerin export.");
  }

  const applications = raw.applications.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Invalid application at row ${index + 1}.`);
    const rawStatus = expectString(item.status, "status");
    const status = rawStatus === "draft" ? "accepted" : rawStatus;
    if (!statuses.has(status)) throw new Error(`Invalid status at application row ${index + 1}.`);

    const appliedAt = isNullableString(item.appliedAt) ? item.appliedAt : null;
    const nextFollowUpAt = isNullableString(item.nextFollowUpAt) ? item.nextFollowUpAt : null;
    const archivedAt = isNullableString(item.archivedAt) ? item.archivedAt : null;
    if (!isValidDateValue(appliedAt) || !isValidDateValue(nextFollowUpAt) || !isValidDateValue(archivedAt)) {
      throw new Error(`Invalid date at application row ${index + 1}.`);
    }

    return {
      id: expectString(item.id, "application id"),
      company: expectString(item.company, "company"),
      role: expectString(item.role, "role"),
      status: status as ExportPayload["applications"][number]["status"],
      appliedAt,
      location: isNullableString(item.location) ? item.location : null,
      jobUrl: isNullableString(item.jobUrl) ? item.jobUrl : null,
      salaryNote: isNullableString(item.salaryNote) ? item.salaryNote : null,
      notes: isNullableString(item.notes) ? item.notes : null,
      nextFollowUpAt,
      followUpNotificationId: null,
      archivedAt,
      createdAt: expectString(item.createdAt, "createdAt"),
      updatedAt: expectString(item.updatedAt, "updatedAt"),
    };
  });

  const applicationIds = new Set(applications.map((item) => item.id));
  const interviews = raw.interviews.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Invalid interview at row ${index + 1}.`);
    const applicationId = expectString(item.applicationId, "applicationId");
    if (!applicationIds.has(applicationId)) {
      throw new Error(`Interview row ${index + 1} references a missing application.`);
    }
    const scheduledAt = isNullableString(item.scheduledAt) ? item.scheduledAt : null;
    if (!isValidDateValue(scheduledAt)) {
      throw new Error(`Invalid date at interview row ${index + 1}.`);
    }
    return {
      id: expectString(item.id, "interview id"),
      applicationId,
      title: expectString(item.title, "interview title"),
      scheduledAt,
      notes: isNullableString(item.notes) ? item.notes : null,
      createdAt: expectString(item.createdAt, "createdAt"),
    };
  });

  return {
    exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : new Date().toISOString(),
    version: 1,
    applications,
    interviews,
  };
}

export async function pickJsonImport(): Promise<ExportPayload | null> {
  if (Platform.OS === "web") {
    throw new Error("Import is not supported on web in this build.");
  }
  const picked = await File.pickFileAsync(undefined, "application/json");
  const file = Array.isArray(picked) ? picked[0] : picked;
  if (!file) return null;
  return parsePayload(JSON.parse(await file.text()));
}
