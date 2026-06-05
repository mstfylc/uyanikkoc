import type { CoachNoteKind } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  createCoachStudentNote,
  deleteCoachStudentNote,
  listCoachStudentNotes,
  toggleCoachStudentNotePin,
} from "@/server/services/coach-notes.service";
import { coachHasStudent } from "@/mocks/roster";

export const GET = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const studentId = req.nextUrl.searchParams.get("studentId")?.trim();
  if (!studentId || !coachHasStudent(coachId, studentId)) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const notes = await listCoachStudentNotes(coachId, studentId);
  return NextResponse.json({ notes }, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as {
    studentId?: string;
    text?: string;
    kind?: CoachNoteKind;
    noteId?: string;
    action?: "pin" | "delete";
  };

  if (body.action === "pin" && body.noteId) {
    const note = await toggleCoachStudentNotePin(coachId, body.noteId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json({ note }, { status: 200 });
  }

  if (body.action === "delete" && body.noteId) {
    const ok = await deleteCoachStudentNote(coachId, body.noteId);
    if (!ok) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!body.studentId || !body.text?.trim() || !body.kind) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!coachHasStudent(coachId, body.studentId)) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const note = await createCoachStudentNote({
    coachId,
    studentId: body.studentId,
    text: body.text,
    kind: body.kind,
  });

  return NextResponse.json({ note }, { status: 200 });
});
