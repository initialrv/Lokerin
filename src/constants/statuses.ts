import type { Language } from "@/i18n/LanguageContext";
import type { ApplicationStatus } from "@/types/models";

export const STATUS_ORDER: ApplicationStatus[] = [
  "applied",
  "withdrawn",
  "screening",
  "interview",
  "rejected",
  "offer",
  "accepted",
];

export const STATUS_LABELS: Record<Language, Record<ApplicationStatus, string>> = {
  en: {
    accepted: "Accepted",
    applied: "Applied",
    screening: "Screening",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  },
  id: {
    accepted: "Diterima",
    applied: "Applied",
    screening: "Screening",
    interview: "Interview",
    offer: "Offer",
    rejected: "Ditolak",
    withdrawn: "Dibatalkan",
  },
};

export const STATUS_LABEL = STATUS_LABELS.en;

export function getStatusLabel(status: ApplicationStatus, language: Language): string {
  return STATUS_LABELS[language][status];
}

export function getStatusFilterOptions(language: Language): { value: ApplicationStatus | "all"; label: string }[] {
  return [
    { value: "all", label: language === "id" ? "Semua" : "All" },
    ...STATUS_ORDER.map((status) => ({ value: status, label: getStatusLabel(status, language) })),
  ];
}
