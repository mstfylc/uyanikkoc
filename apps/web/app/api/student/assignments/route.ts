import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/api-guard";
import { completeAssignment, listAssignmentsForStudent } from "@/lib/data/assignments";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, ["student"]);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const studentId = authResult.session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const assignments = await listAssignmentsForStudent(studentId);
  return NextResponse.json({ assignments }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireAuth(req, ["student"]);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const studentId = authResult.session.user.studentId;
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
}
