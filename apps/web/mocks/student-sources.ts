import { KAYNAK_CATALOG, kaynakLabel } from "@/lib/design/kaynak-catalog";
import { DEMO_STUDENT_ID } from "@/mocks/assignments";

const globalStore = globalThis as typeof globalThis & {
  __uyanikStudentSources?: Map<string, string[]>;
};

const byStudent = globalStore.__uyanikStudentSources ?? (globalStore.__uyanikStudentSources = new Map());

const seedLabels = [
  kaynakLabel(KAYNAK_CATALOG[0]!),
  kaynakLabel(KAYNAK_CATALOG.find((entry) => entry.s === "Türkçe") ?? KAYNAK_CATALOG[0]!),
  kaynakLabel(KAYNAK_CATALOG.find((entry) => entry.t === "konu") ?? KAYNAK_CATALOG[0]!),
];

function seedIfEmpty(studentId: string): void {
  if (byStudent.has(studentId)) return;
  if (studentId === DEMO_STUDENT_ID) {
    byStudent.set(studentId, seedLabels);
    return;
  }
  byStudent.set(studentId, []);
}

export function resetStudentSourcesForTests(): void {
  byStudent.clear();
}

export function listSources(studentId: string): string[] {
  seedIfEmpty(studentId);
  return [...(byStudent.get(studentId) ?? [])];
}

export function addSource(studentId: string, label: string): string[] {
  seedIfEmpty(studentId);
  const trimmed = label.trim();
  if (!trimmed) return listSources(studentId);
  const current = byStudent.get(studentId) ?? [];
  if (current.includes(trimmed)) return current;
  const next = [...current, trimmed];
  byStudent.set(studentId, next);
  return next;
}

export function removeSource(studentId: string, label: string): string[] {
  seedIfEmpty(studentId);
  const next = (byStudent.get(studentId) ?? []).filter((item: string) => item !== label);
  byStudent.set(studentId, next);
  return next;
}
