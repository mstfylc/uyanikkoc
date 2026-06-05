import { prisma } from "../client";
import type { ExamResultRecord, ExamTrendSummary, ResultExamType } from "../types";

function mapExamResult(exam: {
  id: string;
  studentId: string;
  examType: ResultExamType;
  label: string | null;
  takenAt: Date;
  totalNet: number;
  createdAt: Date;
  updatedAt: Date;
  subjects: Array<{
    id: string;
    subjectName: string;
    correct: number;
    wrong: number;
    net: number;
  }>;
}): ExamResultRecord {
  return {
    id: exam.id,
    studentId: exam.studentId,
    examType: exam.examType,
    label: exam.label,
    takenAt: exam.takenAt.toISOString(),
    totalNet: exam.totalNet,
    subjects: exam.subjects.map((subject) => ({
      id: subject.id,
      subjectName: subject.subjectName,
      correct: subject.correct,
      wrong: subject.wrong,
      net: subject.net,
    })),
    createdAt: exam.createdAt.toISOString(),
    updatedAt: exam.updatedAt.toISOString(),
  };
}

export function computeSubjectNet(correct: number, wrong: number): number {
  return correct - wrong / 4;
}

export function computeTotalNet(
  subjects: Array<{ correct: number; wrong: number }>,
): number {
  return subjects.reduce((total, subject) => total + computeSubjectNet(subject.correct, subject.wrong), 0);
}

export function buildExamTrendSummary(exams: ExamResultRecord[]): ExamTrendSummary {
  const sorted = [...exams].sort(
    (left, right) => new Date(right.takenAt).getTime() - new Date(left.takenAt).getTime(),
  );
  const latest = sorted[0];
  const previous = sorted[1];

  let trend: ExamTrendSummary["trend"] = "flat";
  if (latest && previous) {
    if (latest.totalNet > previous.totalNet) {
      trend = "up";
    } else if (latest.totalNet < previous.totalNet) {
      trend = "down";
    }
  }

  return {
    latestNet: latest?.totalNet ?? null,
    previousNet: previous?.totalNet ?? null,
    trend,
    examType: latest?.examType ?? null,
    takenAt: latest?.takenAt ?? null,
    examCount: sorted.length,
  };
}

export async function listExamResultsForStudent(studentId: string): Promise<ExamResultRecord[]> {
  const exams = await prisma.examResult.findMany({
    where: { studentId },
    orderBy: { takenAt: "desc" },
    include: { subjects: true },
  });

  return exams.map(mapExamResult);
}

export async function listExamResultsForStudents(studentIds: string[]): Promise<ExamResultRecord[]> {
  if (studentIds.length === 0) {
    return [];
  }

  const exams = await prisma.examResult.findMany({
    where: { studentId: { in: studentIds } },
    orderBy: { takenAt: "desc" },
    include: { subjects: true },
  });

  return exams.map(mapExamResult);
}
