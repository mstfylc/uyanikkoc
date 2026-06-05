import type { CreateExamResultInput } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { importCoachExamResults, resolveCoachStudentIds } from "@/server/services/exam.service";

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { exams?: CreateExamResultInput[] };
  if (!body.exams?.length) {
    return NextResponse.json({ error: "exams array required" }, { status: 400 });
  }

  const coachStudentIds = await resolveCoachStudentIds(coachId);
  for (const exam of body.exams) {
    if (!coachStudentIds.includes(exam.studentId)) {
      return NextResponse.json({ error: `Student not found: ${exam.studentId}` }, { status: 404 });
    }
  }

  const created = await importCoachExamResults(body.exams);
  return NextResponse.json({ exams: created, count: created.length }, { status: 200 });
});
