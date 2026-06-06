import type { CreateExamResultInput, ResultExamType } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { createCoachExamResult, listStudentExams } from "@/server/services/exam.service";

const EXAM_TYPES: ResultExamType[] = ["TYT", "AYT", "LGS"];

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const result = await listStudentExams(studentId);
  return NextResponse.json(result, { status: 200 });
});

export const POST = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as Partial<CreateExamResultInput>;
  const examType = body.examType;
  const takenAt = body.takenAt?.trim();
  const subjects = body.subjects;

  if (!examType || !EXAM_TYPES.includes(examType)) {
    return NextResponse.json({ error: "Valid examType is required" }, { status: 400 });
  }
  if (!takenAt) {
    return NextResponse.json({ error: "takenAt is required" }, { status: 400 });
  }
  if (!subjects?.length) {
    return NextResponse.json({ error: "subjects are required" }, { status: 400 });
  }

  const exam = await createCoachExamResult({
    studentId,
    examType,
    label: body.label ?? null,
    takenAt,
    subjects,
  });

  return NextResponse.json({ exam }, { status: 200 });
});
