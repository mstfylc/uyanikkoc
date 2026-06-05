import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  completeStudentTest,
  getPsychTestById,
  listPsychTests,
  listStudentTestAssignments,
} from "@/server/services/test.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const [catalog, assignments] = await Promise.all([
    listPsychTests(),
    listStudentTestAssignments(studentId),
  ]);

  return NextResponse.json({ catalog, assignments }, { status: 200 });
});

export const POST = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { assignmentId?: string; answers?: number[] };
  if (!body.assignmentId || !body.answers?.length) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const assignment = await completeStudentTest(body.assignmentId, studentId, body.answers);
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const test = getPsychTestById(assignment.testId);
  return NextResponse.json({ assignment, test }, { status: 200 });
});
