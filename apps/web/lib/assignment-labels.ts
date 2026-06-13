import type { AssignmentPriority, AssignmentStatus, AssignmentType } from "@uyanik/database";

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  homework: "Ödev",
  exam_prep: "Sınav hazırlığı",
  reading: "Okuma",
  practice: "Alıştırma",
  other: "Diğer",
};

export const ASSIGNMENT_PRIORITY_LABELS: Record<AssignmentPriority, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  pending: "Bekliyor",
  in_progress: "Devam ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal",
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
