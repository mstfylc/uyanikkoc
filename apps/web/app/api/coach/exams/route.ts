import type { CreateExamResultInput, ResultExamType } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  createCoachExamResult,
  listCoachExams,
  resolveCoachStudentIds,
} from "@/server/services/exam.service";

const EXAM_TYPES: ResultExamType[] = ["TYT", "AYT", "LGS"];

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const studentIds = await resolveCoachStudentIds(coachId);
  const result = await listCoachExams(studentIds);
  return NextResponse.json(result, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as Partial<CreateExamResultInput>;
  const studentId = body.studentId?.trim();
  const examType = body.examType;
  const takenAt = body.takenAt?.trim();
  const subjects = body.subjects;

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }
  if (!examType || !EXAM_TYPES.includes(examType)) {
    return NextResponse.json({ error: "Valid examType is required" }, { status: 400 });
  }
  if (!takenAt) {
    return NextResponse.json({ error: "takenAt is required" }, { status: 400 });
  }
  if (!subjects?.length) {
    return NextResponse.json({ error: "subjects are required" }, { status: 400 });
  }

  const coachStudentIds = await resolveCoachStudentIds(coachId);
  if (!coachStudentIds.includes(studentId)) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
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
