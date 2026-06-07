import type { CoachNoteKind, CoachStudentNoteRecord } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryNotes from "@/mocks/coach-notes";

export { NOTE_KIND_LABELS } from "@/mocks/coach-notes";

async function repo() {
  const { coachNotesRepository } = await import("@uyanik/database");
  return coachNotesRepository;
}

export async function listCoachStudentNotes(
  coachId: string,
  studentId: string,
): Promise<CoachStudentNoteRecord[]> {
  if (shouldUseDatabase()) return (await repo()).listCoachNotes(coachId, studentId);
  return memoryNotes.listCoachNotes(coachId, studentId);
}

export async function createCoachStudentNote(input: {
  coachId: string;
  studentId: string;
  text: string;
  kind: CoachNoteKind;
}): Promise<CoachStudentNoteRecord> {
  if (shouldUseDatabase()) return (await repo()).createCoachNote(input);
  return memoryNotes.createCoachNote(input);
}

export async function toggleCoachStudentNotePin(
  coachId: string,
  noteId: string,
): Promise<CoachStudentNoteRecord | null> {
  if (shouldUseDatabase()) {
    const r = await repo();
    const note = await r.findCoachNoteById(noteId);
    if (!note || note.coachId !== coachId) return null;
    return r.toggleCoachNotePin(noteId);
  }
  const note = memoryNotes.findCoachNoteById(noteId);
  if (!note || note.coachId !== coachId) return null;
  return memoryNotes.toggleCoachNotePin(noteId);
}

export async function deleteCoachStudentNote(coachId: string, noteId: string): Promise<boolean> {
  if (shouldUseDatabase()) {
    const r = await repo();
    const note = await r.findCoachNoteById(noteId);
    if (!note || note.coachId !== coachId) return false;
    return r.deleteCoachNote(noteId);
  }
  const note = memoryNotes.findCoachNoteById(noteId);
  if (!note || note.coachId !== coachId) return false;
  return memoryNotes.deleteCoachNote(noteId);
}

export async function listStudentVisibleNotes(studentId: string): Promise<CoachStudentNoteRecord[]> {
  if (shouldUseDatabase()) return (await repo()).listPinnedNotesForStudent(studentId);
  return memoryNotes.listPinnedNotesForStudent(studentId);
}
