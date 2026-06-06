import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { submitOptik } from "@/server/services/online-exam.service";

export const POST = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) return NextResponse.json({ error: "Student profile missing" }, { status: 400 });

  const examId = req.url.split("/online-exams/")[1]?.split("/")[0];
  if (!examId) return NextResponse.json({ error: "exam id missing" }, { status: 400 });

  const body = (await req.json()) as { answers?: (string | null)[] };
  if (!Array.isArray(body.answers)) {
    return NextResponse.json({ error: "answers[] required" }, { status: 400 });
  }

  try {
    const submission = await submitOptik({ examId, studentId, answers: body.answers });
    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "EXAM_NOT_FOUND") {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }
    throw error;
  }
});
