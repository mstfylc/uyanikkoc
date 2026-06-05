import type { CoachNoteKind, CoachStudentNoteRecord } from "@uyanik/database";

import * as memoryNotes from "@/mocks/coach-notes";

export { NOTE_KIND_LABELS } from "@/mocks/coach-notes";

export async function listCoachStudentNotes(
  coachId: string,
  studentId: string,
): Promise<CoachStudentNoteRecord[]> {
  return memoryNotes.listCoachNotes(coachId, studentId);
}

export async function createCoachStudentNote(input: {
  coachId: string;
  studentId: string;
  text: string;
  kind: CoachNoteKind;
}): Promise<CoachStudentNoteRecord> {
  return memoryNotes.createCoachNote(input);
}

export async function toggleCoachStudentNotePin(
  coachId: string,
  noteId: string,
): Promise<CoachStudentNoteRecord | null> {
  const note = memoryNotes.findCoachNoteById(noteId);
  if (!note || note.coachId !== coachId) {
    return null;
  }
  return memoryNotes.toggleCoachNotePin(noteId);
}

export async function deleteCoachStudentNote(coachId: string, noteId: string): Promise<boolean> {
  const note = memoryNotes.findCoachNoteById(noteId);
  if (!note || note.coachId !== coachId) {
    return false;
  }
  return memoryNotes.deleteCoachNote(noteId);
}

export async function listStudentVisibleNotes(studentId: string): Promise<CoachStudentNoteRecord[]> {
  return memoryNotes.listPinnedNotesForStudent(studentId);
}
