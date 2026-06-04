import type { AssignmentPriority, AssignmentStatus, AssignmentType } from "@uyanik/database";

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  homework: "Odev",
  exam_prep: "Sinav hazirligi",
  reading: "Okuma",
  practice: "Alistirma",
  other: "Diger",
};

export const ASSIGNMENT_PRIORITY_LABELS: Record<AssignmentPriority, string> = {
  low: "Dusuk",
  medium: "Orta",
  high: "Yuksek",
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  pending: "Bekliyor",
  in_progress: "Devam ediyor",
  completed: "Tamamlandi",
  cancelled: "Iptal",
};

export function isAssignmentOpen(assignment: {
  status: AssignmentStatus | string;
  completed: boolean;
}): boolean {
  return (
    !assignment.completed &&
    assignment.status !== "completed" &&
    assignment.status !== "cancelled"
  );
}

export function formatAssignmentDueDate(value: string | null): string {
  if (!value) {
    return "Belirtilmedi";
  }

  return new Date(value).toLocaleDateString("tr-TR");
}
