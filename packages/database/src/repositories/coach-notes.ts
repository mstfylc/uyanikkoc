import { prisma } from "../client";
import type { CoachNoteKind, CoachStudentNoteRecord } from "../types";

function map(note: {
  id: string;
  coachId: string;
  studentId: string;
  text: string;
  kind: CoachNoteKind;
  pinned: boolean;
  createdAt: Date;
}): CoachStudentNoteRecord {
  return {
    id: note.id,
    coachId: note.coachId,
    studentId: note.studentId,
    text: note.text,
    kind: note.kind,
    pinned: note.pinned,
    createdAt: note.createdAt.toISOString(),
  };
}

export async function listCoachNotes(
  coachId: string,
  studentId: string,
): Promise<CoachStudentNoteRecord[]> {
  const rows = await prisma.coachStudentNote.findMany({
    where: { coachId, studentId },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(map);
}

export async function listPinnedNotesForStudent(
  studentId: string,
): Promise<CoachStudentNoteRecord[]> {
  const rows = await prisma.coachStudentNote.findMany({
    where: { studentId, pinned: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(map);
}

export async function createCoachNote(input: {
  coachId: string;
  studentId: string;
  text: string;
  kind: CoachNoteKind;
}): Promise<CoachStudentNoteRecord> {
  const row = await prisma.coachStudentNote.create({
    data: {
      coachId: input.coachId,
      studentId: input.studentId,
      text: input.text.trim(),
      kind: input.kind,
    },
  });
  return map(row);
}

export async function findCoachNoteById(id: string): Promise<CoachStudentNoteRecord | null> {
  const row = await prisma.coachStudentNote.findUnique({ where: { id } });
  return row ? map(row) : null;
}

export async function toggleCoachNotePin(id: string): Promise<CoachStudentNoteRecord | null> {
  const existing = await prisma.coachStudentNote.findUnique({ where: { id } });
  if (!existing) return null;
  const row = await prisma.coachStudentNote.update({
    where: { id },
    data: { pinned: !existing.pinned },
  });
  return map(row);
}

export async function deleteCoachNote(id: string): Promise<boolean> {
  const result = await prisma.coachStudentNote.deleteMany({ where: { id } });
  return result.count > 0;
}
