import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { listCoachExams, resolveCoachStudentIds } from "@/server/services/exam.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const studentIds = await resolveCoachStudentIds(coachId);
  const result = await listCoachExams(studentIds);
  return NextResponse.json(result, { status: 200 });
});
