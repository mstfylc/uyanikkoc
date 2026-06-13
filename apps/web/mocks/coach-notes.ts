import type { CoachNoteKind, CoachStudentNoteRecord } from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";

export const NOTE_KIND_LABELS: Record<
  CoachNoteKind,
  { label: string; tone: "primary" | "warning" | "muted"; icon: string }
> = {
  meeting: { label: "Görüşme notu", tone: "primary", icon: "ki-messages" },
  warning: { label: "Uyari", tone: "warning", icon: "ki-information-2" },
  general: { label: "Genel", tone: "muted", icon: "ki-notepad" },
};

const globalStore = globalThis as typeof globalThis & {
  __uyanikCoachNotes?: CoachStudentNoteRecord[];
};

const notes = globalStore.__uyanikCoachNotes ?? (globalStore.__uyanikCoachNotes = []);

function nowIso(): string {
  return new Date().toISOString();
}

function seedIfEmpty() {
  if (notes.length > 0) {
    return;
  }

  notes.push(
    {
      id: "note_001",
      coachId: "coach_001",
      studentId: DEMO_STUDENT_ID,
      text: "Türev konusunda görüşme yapıldı. Kural tekrarı için ek kaynak verildi.",
      kind: "meeting",
      pinned: false,
      createdAt: nowIso(),
    },
    {
      id: "note_002",
      coachId: "coach_001",
      studentId: DEMO_STUDENT_ID,
      text: "Deneme kaygisi var, sinav oncesi nefes egzersizi oner.",
      kind: "warning",
      pinned: true,
      createdAt: nowIso(),
    },
  );
}

export function listCoachNotes(coachId: string, studentId: string): CoachStudentNoteRecord[] {
  seedIfEmpty();
  return notes
    .filter((item) => item.coachId === coachId && item.studentId === studentId)
    .sort((left, right) => Number(right.pinned) - Number(left.pinned));
}

export function listPinnedNotesForStudent(studentId: string): CoachStudentNoteRecord[] {
  seedIfEmpty();
  return notes.filter((item) => item.studentId === studentId && item.pinned);
}

export function createCoachNote(input: {
  coachId: string;
  studentId: string;
  text: string;
  kind: CoachNoteKind;
}): CoachStudentNoteRecord {
  seedIfEmpty();
  const record: CoachStudentNoteRecord = {
    id: `note_${Date.now()}`,
    coachId: input.coachId,
    studentId: input.studentId,
    text: input.text.trim(),
    kind: input.kind,
    pinned: false,
    createdAt: nowIso(),
  };
  notes.unshift(record);
  return record;
}

export function findCoachNoteById(id: string): CoachStudentNoteRecord | undefined {
  seedIfEmpty();
  return notes.find((item) => item.id === id);
}

export function toggleCoachNotePin(id: string): CoachStudentNoteRecord | null {
  seedIfEmpty();
  const index = notes.findIndex((item) => item.id === id);
  if (index < 0) {
    return null;
  }
  notes[index] = { ...notes[index], pinned: !notes[index].pinned };
  return notes[index];
}

export function deleteCoachNote(id: string): boolean {
  seedIfEmpty();
  const index = notes.findIndex((item) => item.id === id);
  if (index < 0) {
    return false;
  }
  notes.splice(index, 1);
  return true;
}
