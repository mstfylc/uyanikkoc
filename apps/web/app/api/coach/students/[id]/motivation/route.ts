import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { setStudentMotivationEnabled } from "@/server/services/motivation.service";

function getStudentId(req: Request): string {
  const segments = new URL(req.url).pathname.split("/").filter(Boolean);
  const studentsIndex = segments.indexOf("students");
  return studentsIndex >= 0 ? (segments[studentsIndex + 1] ?? "") : "";
}

export const PATCH = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const studentId = getStudentId(req);
  if (!studentId) {
    return NextResponse.json({ error: "Student id is required" }, { status: 400 });
  }

  const { coachHasStudent } = await import("@/server/services/roster.service");
  const hasStudent = await coachHasStudent(coachId, studentId);
  if (!hasStudent) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const body = (await req.json()) as { enabled?: boolean };
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
  }

  const profile = await setStudentMotivationEnabled(studentId, body.enabled);
  if (!profile) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile }, { status: 200 });
});
