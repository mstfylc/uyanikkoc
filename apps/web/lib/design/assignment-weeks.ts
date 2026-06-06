export const ASSIGNMENT_WEEKS = [
  { id: "w0", label: "Bu hafta" },
  { id: "w1", label: "Gecen hafta" },
  { id: "w2", label: "2 hafta once" },
  { id: "w3", label: "3 hafta once" },
] as const;

export type AssignmentWeekId = (typeof ASSIGNMENT_WEEKS)[number]["id"];

/** dueDate veya createdAt uzerinden hafta grubu (w0 = son 7 gun). */
export function weekIdForIsoDate(iso: string): AssignmentWeekId {
  const ref = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return "w0";
  if (diffDays <= 14) return "w1";
  if (diffDays <= 21) return "w2";
  return "w3";
}

export function weekIdForAssignment(item: { dueDate: string | null; createdAt?: string }): AssignmentWeekId {
  const ref = item.dueDate ?? item.createdAt ?? new Date().toISOString();
  return weekIdForIsoDate(ref);
}

/** Odev turune gore varsayilan soru hedefi (haftalik toplam icin). */
export function defaultQuestionTarget(type: string): number {
  if (type === "reading" || type === "other") return 0;
  if (type === "exam_prep") return 120;
  return 40;
}
