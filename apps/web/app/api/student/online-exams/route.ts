import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { listStudentExams } from "@/server/services/online-exam.service";

export const GET = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  const branchId = session.user.branchId;
  if (!studentId || !branchId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }
  const sinav = new URL(req.url).searchParams.get("sinav") ?? "YKS";
  const examTypes = sinav === "LGS" ? (["LGS"] as const) : (["TYT", "AYT"] as const);
  const exams = await listStudentExams(branchId, studentId, [...examTypes]);
  return NextResponse.json({ exams }, { status: 200 });
});
