import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getStudentAgenda } from "@/server/services/schedule.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const agenda = await getStudentAgenda(studentId);
  return NextResponse.json({ agenda }, { status: 200 });
});
