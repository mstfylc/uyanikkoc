import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getStudentMotivationSummary } from "@/server/services/motivation.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const motivation = await getStudentMotivationSummary(studentId);
  return NextResponse.json({ motivation }, { status: 200 });
});
