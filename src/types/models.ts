export type ApplicationStatus =
  | "accepted"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt: string | null; // ISO 8601
  location: string | null;
  jobUrl: string | null;
  salaryNote: string | null;
  notes: string | null;
  nextFollowUpAt: string | null;
  followUpNotificationId: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewEvent {
  id: string;
  applicationId: string;
  title: string;
  scheduledAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ApplicationRow {
  id: string;
  company: string;
  role: string;
  status: string;
  applied_at: string | null;
  location: string | null;
  job_url: string | null;
  salary_note: string | null;
  notes: string | null;
  next_follow_up_at: string | null;
  follow_up_notification_id: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewRow {
  id: string;
  application_id: string;
  title: string;
  scheduled_at: string | null;
  notes: string | null;
  created_at: string;
}

export function rowToApplication(r: ApplicationRow): JobApplication {
  return {
    id: r.id,
    company: r.company,
    role: r.role,
    status: r.status as ApplicationStatus,
    appliedAt: r.applied_at,
    location: r.location,
    jobUrl: r.job_url,
    salaryNote: r.salary_note,
    notes: r.notes,
    nextFollowUpAt: r.next_follow_up_at,
    followUpNotificationId: r.follow_up_notification_id,
    archivedAt: r.archived_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function rowToInterview(r: InterviewRow): InterviewEvent {
  return {
    id: r.id,
    applicationId: r.application_id,
    title: r.title,
    scheduledAt: r.scheduled_at,
    notes: r.notes,
    createdAt: r.created_at,
  };
}

export type DbReadyState = "loading" | "ready" | "error";
