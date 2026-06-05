import type { CreateExamResultInput, ResultExamType } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { importCoachExamResults, resolveCoachStudentIds } from "@/server/services/exam.service";

const EXAM_TYPES: ResultExamType[] = ["TYT", "AYT", "LGS"];

function isValidCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/** Gelen satiri dogrular; gecersizse hata mesaji, gecerliyse null doner. */
function validateExam(exam: CreateExamResultInput, index: number): string | null {
  if (!exam.studentId?.trim()) {
    return `Satir ${index + 1}: studentId zorunlu`;
  }
  if (!EXAM_TYPES.includes(exam.examType)) {
    return `Satir ${index + 1}: gecersiz examType`;
  }
  if (!exam.takenAt || Number.isNaN(new Date(exam.takenAt).getTime())) {
    return `Satir ${index + 1}: gecersiz tarih`;
  }
  if (!Array.isArray(exam.subjects) || exam.subjects.length === 0) {
    return `Satir ${index + 1}: en az bir ders gerekli`;
  }
  for (const subject of exam.subjects) {
    if (!subject.subjectName?.trim()) {
      return `Satir ${index + 1}: ders adi bos olamaz`;
    }
    if (!isValidCount(subject.correct) || !isValidCount(subject.wrong)) {
      return `Satir ${index + 1}: dogru/yanlis sayilari negatif olmayan sayi olmali`;
    }
  }
  return null;
}

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { exams?: CreateExamResultInput[] };
  if (!body.exams?.length) {
    return NextResponse.json({ error: "exams array required" }, { status: 400 });
  }

  for (let i = 0; i < body.exams.length; i += 1) {
    const error = validateExam(body.exams[i], i);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
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
