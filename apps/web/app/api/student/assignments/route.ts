import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { completeAssignment, listAssignmentsForStudent } from "@/lib/data/assignments";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const assignments = await listAssignmentsForStudent(studentId);
  return NextResponse.json({ assignments }, { status: 200 });
});

export const PATCH = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { assignmentId?: string };
  if (!body.assignmentId) {
    return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
  }

  const assignment = await completeAssignment(body.assignmentId, studentId);
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  return NextResponse.json({ assignment }, { status: 200 });
});
