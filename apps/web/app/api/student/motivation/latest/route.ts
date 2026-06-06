import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { latestMotivation } from "@/server/services/motivation-broadcast.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) return NextResponse.json({ error: "Student missing" }, { status: 400 });
  const message = await latestMotivation(studentId);
  return NextResponse.json({ message }, { status: 200 });
});
