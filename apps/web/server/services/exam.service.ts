import type { ExamResultRecord, ExamTrendSummary } from "@uyanik/database";
import { buildExamTrendSummary } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryExams from "@/mocks/exams";

export type StudentExamListResult = {
  exams: ExamResultRecord[];
  summary: ExamTrendSummary;
};

async function listExamResultsForStudent(studentId: string): Promise<ExamResultRecord[]> {
  if (shouldUseDatabase()) {
    const { examRepository } = await import("@uyanik/database");
    return examRepository.listExamResultsForStudent(studentId);
  }

  return memoryExams.listExamResultsForStudent(studentId);
}

async function listExamResultsForStudents(studentIds: string[]): Promise<ExamResultRecord[]> {
  if (shouldUseDatabase()) {
    const { examRepository } = await import("@uyanik/database");
    return examRepository.listExamResultsForStudents(studentIds);
  }

  return memoryExams.listExamResultsForStudents(studentIds);
}

export async function listStudentExams(studentId: string): Promise<StudentExamListResult> {
  const exams = await listExamResultsForStudent(studentId);
  return { exams, summary: buildExamTrendSummary(exams) };
}

export async function listCoachExams(studentIds: string[]): Promise<StudentExamListResult> {
  const exams = await listExamResultsForStudents(studentIds);
  return { exams, summary: buildExamTrendSummary(exams) };
}

export async function createCoachExamResult(
  input: import("@uyanik/database").CreateExamResultInput,
): Promise<ExamResultRecord> {
  if (shouldUseDatabase()) {
    const { examRepository } = await import("@uyanik/database");
    return examRepository.createExamResult(input);
  }

  return memoryExams.createExamResult(input);
}

export async function resolveCoachStudentIds(coachId: string): Promise<string[]> {
  const { listCoachRoster } = await import("@/server/services/roster.service");
  const roster = await listCoachRoster(coachId);
  return roster.map((entry) => entry.studentId);
}
