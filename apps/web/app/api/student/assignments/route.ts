import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { toOdevContract } from "@/lib/contracts/web-v6";
import {
  completeStudentAssignment,
  listStudentAssignments,
  submitStudentAssignmentResult,
} from "@/server/services/assignment.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const assignments = await listStudentAssignments(studentId);
  return NextResponse.json({ assignments, odevler: assignments.map(toOdevContract) }, { status: 200 });
});

export const PATCH = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as {
    assignmentId?: string;
    status?: "completed";
    result?: { correct?: number; wrong?: number; blank?: number; d?: number; y?: number; b?: number };
  };

  if (!body.assignmentId) {
    return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
  }

  if (body.result) {
    const payload = await submitStudentAssignmentResult(body.assignmentId, studentId, {
      correct: body.result.correct ?? body.result.d ?? 0,
      wrong: body.result.wrong ?? body.result.y ?? 0,
      blank: body.result.blank ?? body.result.b ?? 0,
    });
    if (!payload) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }
    return NextResponse.json({ ...payload, odev: toOdevContract(payload.assignment) }, { status: 200 });
  }

  const assignment = await completeStudentAssignment(body.assignmentId, studentId);
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  return NextResponse.json({ assignment, odev: toOdevContract(assignment) }, { status: 200 });
});
