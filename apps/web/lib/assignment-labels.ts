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

export function buildSimpleWeeklyComment(
  completionRate: number,
  pendingCount: number,
  overdueCount: number,
): string {
  if (pendingCount === 0) {
    return "Tum odevler tamamlandi. Harika bir hafta!";
  }

  if (overdueCount > 0) {
    return `${overdueCount} gecikmis odev var. Bu hafta odak noktasi tamamlama olmali.`;
  }

  if (completionRate >= 80) {
    return "Ilerleme guclu. Kalan odevler icin duzenli calisma surdurulebilir.";
  }

  if (completionRate >= 50) {
    return "Orta duzey ilerleme. Hafta sonuna kadar bekleyen odevler tamamlanmali.";
  }

  return "Ilerleme dusuk. Haftalik plan gozden gecirilmeli ve oncelikli odevler belirlenmeli.";
}

export function countOverdueAssignments(
  assignments: Array<{ dueDate: string | null; status: string; completed: boolean }>,
  now = new Date(),
): number {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return assignments.filter((assignment) => {
    if (!isAssignmentOpen(assignment) || !assignment.dueDate) {
      return false;
    }

    const due = new Date(assignment.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;
}
