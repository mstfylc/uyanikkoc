import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { listStudentExams } from "@/server/services/exam.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const result = await listStudentExams(studentId);
  return NextResponse.json(result, { status: 200 });
});
