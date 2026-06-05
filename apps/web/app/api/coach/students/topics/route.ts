import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getStudentSchedule } from "@/server/services/schedule.service";
import { listStudentTopics } from "@/server/services/topic.service";
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

  const [topics, schedule] = await Promise.all([
    listStudentTopics(studentId),
    getStudentSchedule(studentId),
  ]);

  return NextResponse.json({ topics, schedule }, { status: 200 });
});
