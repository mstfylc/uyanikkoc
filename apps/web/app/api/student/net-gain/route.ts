import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getStudentNetGainMap } from "@/server/services/exam.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const netGain = await getStudentNetGainMap(studentId);
  return NextResponse.json({ netGain }, { status: 200 });
});
