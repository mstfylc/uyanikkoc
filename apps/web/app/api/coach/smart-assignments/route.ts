import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  assignCoachSmartAssignment,
  previewCoachSmartAssignment,
} from "@/server/services/assignment.service";

type SmartAssignmentBody = {
  action?: "preview" | "assign";
  studentId?: string;
};

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  const branchId = session.user.branchId;
  if (!coachId || !branchId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as SmartAssignmentBody;
  const studentId = body.studentId?.trim();
  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  if (body.action === "assign") {
    const result = await assignCoachSmartAssignment(coachId, branchId, studentId);
    if (!result) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json(result, { status: 200 });
  }

  const preview = await previewCoachSmartAssignment(coachId, studentId);
  if (!preview) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ preview }, { status: 200 });
});
