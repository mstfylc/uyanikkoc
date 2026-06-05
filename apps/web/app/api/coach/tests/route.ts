import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  listCoachTestAssignments,
  listPsychTests,
  sendCoachTest,
  setCoachTestNote,
} from "@/server/services/test.service";
import { listCoachRoster } from "@/server/services/roster.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const [catalog, assignments] = await Promise.all([
    listPsychTests(),
    listCoachTestAssignments(coachId),
  ]);

  return NextResponse.json({ catalog, assignments }, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as {
    studentId?: string;
    testId?: string;
    assignmentId?: string;
    coachNote?: string;
  };

  if (body.assignmentId && body.coachNote != null) {
    const assignment = await setCoachTestNote(coachId, body.assignmentId, body.coachNote);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }
    return NextResponse.json({ assignment }, { status: 200 });
  }

  if (!body.studentId || !body.testId) {
    return NextResponse.json({ error: "studentId and testId required" }, { status: 400 });
  }

  const roster = await listCoachRoster(coachId);
  const entry = roster.find((item) => item.studentId === body.studentId);
  if (!entry) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const assignment = await sendCoachTest({
    coachId,
    studentId: entry.studentId,
    studentName: entry.displayName,
    testId: body.testId,
  });

  return NextResponse.json({ assignment }, { status: 200 });
});
