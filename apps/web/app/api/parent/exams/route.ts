import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { listStudentExams } from "@/server/services/exam.service";
import { resolveStudentIdForParent } from "@/server/services/motivation.service";

export const GET = withApiAuth(["parent"], async (_req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const studentId = await resolveStudentIdForParent(parentId);
  if (!studentId) {
    return NextResponse.json({ exams: [], summary: null }, { status: 200 });
  }

  const result = await listStudentExams(studentId);
  return NextResponse.json(result, { status: 200 });
});
