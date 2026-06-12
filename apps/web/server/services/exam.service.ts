import type { ExamResultRecord, ExamTrendSummary } from "@uyanik/database";
import { buildExamTrendSummary } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryExams from "@/mocks/exams";
import { resolveStudentIdForParent } from "@/server/services/motivation.service";
import { coachHasStudent } from "@/server/services/roster.service";

export type StudentExamListResult = {
  exams: ExamResultRecord[];
  summary: ExamTrendSummary;
};

export type NetGainItem = {
  subject: string;
  currentNet: number;
  previousNet: number | null;
  gain: number;
  trend: "up" | "down" | "flat";
};

export type NetGainMapResult = {
  latestNet: number | null;
  previousNet: number | null;
  totalGain: number | null;
  examCount: number;
  examType: ExamTrendSummary["examType"];
  takenAt: string | null;
  items: NetGainItem[];
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

function buildNetGainMap(exams: ExamResultRecord[]): NetGainMapResult {
  const sorted = [...exams].sort(
    (left, right) => new Date(right.takenAt).getTime() - new Date(left.takenAt).getTime(),
  );
  const latest = sorted[0] ?? null;
  const previous = sorted[1] ?? null;
  const previousBySubject = new Map(previous?.subjects.map((subject) => [subject.subjectName, subject.net]) ?? []);
  const summary = buildExamTrendSummary(sorted);

  return {
    latestNet: latest?.totalNet ?? null,
    previousNet: previous?.totalNet ?? null,
    totalGain: latest && previous ? Number((latest.totalNet - previous.totalNet).toFixed(2)) : null,
    examCount: sorted.length,
    examType: summary.examType,
    takenAt: summary.takenAt,
    items: latest
      ? latest.subjects
          .map((subject) => {
            const previousNet = previousBySubject.get(subject.subjectName) ?? null;
            const gain = previousNet == null ? 0 : Number((subject.net - previousNet).toFixed(2));
            return {
              subject: subject.subjectName,
              currentNet: subject.net,
              previousNet,
              gain,
              trend: gain > 0 ? "up" as const : gain < 0 ? "down" as const : "flat" as const,
            };
          })
          .sort((left, right) => right.gain - left.gain)
      : [],
  };
}

export async function getStudentNetGainMap(studentId: string): Promise<NetGainMapResult> {
  return buildNetGainMap(await listExamResultsForStudent(studentId));
}

export async function getCoachStudentNetGainMap(coachId: string, studentId: string): Promise<NetGainMapResult | null> {
  if (!(await coachHasStudent(coachId, studentId))) {
    return null;
  }

  return getStudentNetGainMap(studentId);
}

export async function getParentNetGainMap(parentId: string): Promise<NetGainMapResult | null> {
  const studentId = await resolveStudentIdForParent(parentId);
  if (!studentId) {
    return null;
  }

  return getStudentNetGainMap(studentId);
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

export async function importCoachExamResults(
  inputs: import("@uyanik/database").CreateExamResultInput[],
): Promise<ExamResultRecord[]> {
  const created: ExamResultRecord[] = [];
  for (const input of inputs) {
    created.push(await createCoachExamResult(input));
  }
  return created;
}

export async function resolveCoachStudentIds(coachId: string): Promise<string[]> {
  const { listCoachRoster } = await import("@/server/services/roster.service");
  const roster = await listCoachRoster(coachId);
  return roster.map((entry) => entry.studentId);
}
