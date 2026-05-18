import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { STATUS_LABEL } from "@/constants/statuses";
import type { JobApplication, InterviewEvent } from "@/types/models";

export interface ExportPayload {
  exportedAt: string;
  version: 1;
  applications: JobApplication[];
  interviews: InterviewEvent[];
}

function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: value.includes("T") ? "short" : undefined });
}

function csvCell(value: string | number | null | undefined): string {
  const raw = value === null || value === undefined ? "" : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

function buildCsv(payload: ExportPayload): string {
  const interviewsByApp = new Map<string, number>();
  for (const interview of payload.interviews) {
    interviewsByApp.set(interview.applicationId, (interviewsByApp.get(interview.applicationId) ?? 0) + 1);
  }

  const header = [
    "Company",
    "Role/Title",
    "Status",
    "Applied Date",
    "Follow-up Date",
    "Location",
    "Salary Range",
    "Job Posting Link",
    "Notes",
    "Archived",
    "Interview Count",
    "Updated",
  ];

  const rows = payload.applications.map((app) =>
    [
      app.company,
      app.role,
      STATUS_LABEL[app.status],
      app.appliedAt,
      app.nextFollowUpAt,
      app.location,
      app.salaryNote,
      app.jobUrl,
      app.notes,
      app.archivedAt ? "Yes" : "No",
      interviewsByApp.get(app.id) ?? 0,
      app.updatedAt,
    ]
      .map(csvCell)
      .join(",")
  );

  return [header.map(csvCell).join(","), ...rows].join("\n");
}

function buildPdfHtml(payload: ExportPayload): string {
  const interviewsByApp = new Map<string, InterviewEvent[]>();
  for (const interview of payload.interviews) {
    const list = interviewsByApp.get(interview.applicationId) ?? [];
    list.push(interview);
    interviewsByApp.set(interview.applicationId, list);
  }

  const rows = payload.applications
    .map((app) => {
      const interviews = interviewsByApp.get(app.id) ?? [];
      const interviewHtml = interviews.length
        ? interviews
            .map(
              (interview) => `
                <li>
                  <strong>${escapeHtml(interview.title)}</strong>
                  <span>${formatDate(interview.scheduledAt)}</span>
                  ${interview.notes ? `<p>${escapeHtml(interview.notes)}</p>` : ""}
                </li>`
            )
            .join("")
        : "<li>No interviews logged</li>";

      return `
        <section class="card">
          <div class="top">
            <div>
              <h2>${escapeHtml(app.company)}</h2>
              <p class="role">${escapeHtml(app.role)}</p>
            </div>
            <span class="badge">${escapeHtml(STATUS_LABEL[app.status])}</span>
          </div>
          <div class="grid">
            <div><label>Applied</label><p>${formatDate(app.appliedAt)}</p></div>
            <div><label>Follow-up</label><p>${formatDate(app.nextFollowUpAt)}</p></div>
            <div><label>Location</label><p>${escapeHtml(app.location) || "-"}</p></div>
            <div><label>Salary Range</label><p>${escapeHtml(app.salaryNote) || "-"}</p></div>
          </div>
          ${app.jobUrl ? `<p><label>Job Posting Link</label><br/>${escapeHtml(app.jobUrl)}</p>` : ""}
          ${app.notes ? `<p class="notes"><label>Notes</label><br/>${escapeHtml(app.notes).replace(/\n/g, "<br/>")}</p>` : ""}
          <label>Interviews</label>
          <ul>${interviewHtml}</ul>
        </section>`;
    })
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #162012; padding: 28px; background: #fbfdf8; }
          .cover { border: 1px solid #b9d99a; background: #e8f8d8; border-radius: 18px; padding: 20px; margin-bottom: 18px; }
          h1 { margin: 0 0 4px; font-size: 30px; }
          .tagline { color: #4c7d24; font-weight: 800; margin: 0; }
          .meta { color: #68745e; margin: 12px 0 0; }
          .card { background: #ffffff; border: 1px solid #d5dfc9; border-radius: 14px; padding: 16px; margin-bottom: 14px; page-break-inside: avoid; }
          .top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
          h2 { margin: 0; font-size: 20px; }
          .role { margin: 4px 0 0; color: #68745e; }
          .badge { border: 1px solid #8fd14f; background: #e8f8d8; border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; margin: 14px 0; }
          label { color: #68745e; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          p { margin: 4px 0 10px; line-height: 1.45; }
          .notes { white-space: normal; }
          ul { margin-top: 8px; padding-left: 18px; }
          li { margin-bottom: 8px; }
          li span { color: #68745e; display: block; font-size: 12px; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="cover">
          <h1>Lokerin Export</h1>
          <p class="tagline">A friend for your job search journey.</p>
          <div class="meta">Exported ${formatDate(payload.exportedAt)} / ${payload.applications.length} applications / ${payload.interviews.length} interviews</div>
        </div>
        ${rows || "<p>No applications exported.</p>"}
      </body>
    </html>`;
}

/**
 * Writes JSON to cache and opens the system share sheet (no network).
 */
export async function shareJsonExport(filename: string, payload: ExportPayload): Promise<void> {
  if (Platform.OS === "web") {
    throw new Error("Export via share sheet is not supported on web in this build.");
  }
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(JSON.stringify(payload, null, 2));
  const can = await Sharing.isAvailableAsync();
  if (!can) {
    throw new Error("Sharing is not available on this device.");
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "Export job applications",
    UTI: "public.json",
  });
}

export async function shareCsvExport(filename: string, payload: ExportPayload): Promise<void> {
  if (Platform.OS === "web") {
    throw new Error("CSV export via share sheet is not supported on web in this build.");
  }
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(buildCsv(payload));
  const can = await Sharing.isAvailableAsync();
  if (!can) {
    throw new Error("Sharing is not available on this device.");
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: "text/csv",
    dialogTitle: "Export Lokerin CSV",
    UTI: "public.comma-separated-values-text",
  });
}

export async function sharePdfExport(filename: string, payload: ExportPayload): Promise<void> {
  if (Platform.OS === "web") {
    throw new Error("PDF export via share sheet is not supported on web in this build.");
  }
  const result = await Print.printToFileAsync({
    html: buildPdfHtml(payload),
    base64: false,
  });
  const output = new File(Paths.cache, filename);
  if (output.exists) {
    output.delete();
  }
  new File(result.uri).copy(output);
  const can = await Sharing.isAvailableAsync();
  if (!can) {
    throw new Error("Sharing is not available on this device.");
  }
  await Sharing.shareAsync(output.uri, {
    mimeType: "application/pdf",
    dialogTitle: "Export Lokerin PDF",
    UTI: "com.adobe.pdf",
  });
}
