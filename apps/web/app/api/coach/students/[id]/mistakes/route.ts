import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getCoachStudentMistakeInsights } from "@/server/services/mistake.service";

function getStudentId(req: Request): string {
  const segments = new URL(req.url).pathname.split("/").filter(Boolean);
  const studentsIndex = segments.indexOf("students");
  return studentsIndex >= 0 ? (segments[studentsIndex + 1] ?? "") : "";
}

export const GET = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const studentId = getStudentId(req);
  if (!studentId) {
    return NextResponse.json({ error: "Student id is required" }, { status: 400 });
  }

  const insights = await getCoachStudentMistakeInsights(coachId, studentId);
  if (!insights) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ insights }, { status: 200 });
});
