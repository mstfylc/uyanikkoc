import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getOptikReview } from "@/server/services/online-exam.service";

export const GET = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) return NextResponse.json({ error: "Student profile missing" }, { status: 400 });

  const examId = req.url.split("/online-exams/")[1]?.split("/")[0];
  if (!examId) return NextResponse.json({ error: "exam id missing" }, { status: 400 });

  const review = await getOptikReview(examId, studentId);
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  return NextResponse.json(review, { status: 200 });
});
