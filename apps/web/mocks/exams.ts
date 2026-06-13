import type { ExamResultRecord, ExamTrendSummary } from "@uyanik/database";
import { buildExamTrendSummary } from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";
import { DEMO_STUDENT_002_ID } from "@/mocks/roster";

const globalStore = globalThis as typeof globalThis & {
  __uyanikExamResults?: ExamResultRecord[];
};

const examResults = globalStore.__uyanikExamResults ?? (globalStore.__uyanikExamResults = []);

function nowIso(): string {
  return new Date().toISOString();
}

function seedIfEmpty() {
  if (examResults.length > 0) {
    return;
  }

  const olderTakenAt = "2026-05-10T10:00:00.000Z";
  const newerTakenAt = "2026-06-01T10:00:00.000Z";
  const timestamp = nowIso();

  examResults.push(
    {
      id: "exam_mem_tyt_1",
      studentId: DEMO_STUDENT_ID,
      examType: "TYT",
      label: "TYT Deneme 1",
      takenAt: olderTakenAt,
      totalNet: 70.25,
      subjects: [
        { id: "exam_sub_1", subjectName: "Türkçe", correct: 32, wrong: 6, net: 30.5 },
        { id: "exam_sub_2", subjectName: "Matematik", correct: 18, wrong: 8, net: 16 },
        { id: "exam_sub_3", subjectName: "Fen", correct: 12, wrong: 5, net: 10.75 },
        { id: "exam_sub_4", subjectName: "Sosyal", correct: 14, wrong: 4, net: 13 },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "exam_mem_tyt_2",
      studentId: DEMO_STUDENT_ID,
      examType: "TYT",
      label: "TYT Deneme 2",
      takenAt: newerTakenAt,
      totalNet: 77,
      subjects: [
        { id: "exam_sub_5", subjectName: "Türkçe", correct: 34, wrong: 5, net: 32.75 },
        { id: "exam_sub_6", subjectName: "Matematik", correct: 20, wrong: 7, net: 18.25 },
        { id: "exam_sub_7", subjectName: "Fen", correct: 13, wrong: 4, net: 12 },
        { id: "exam_sub_8", subjectName: "Sosyal", correct: 15, wrong: 4, net: 14 },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "exam_mem_tyt_1_s2",
      studentId: DEMO_STUDENT_002_ID,
      examType: "TYT",
      label: "TYT Deneme 1",
      takenAt: olderTakenAt,
      totalNet: 65.5,
      subjects: [
        { id: "exam_sub_9", subjectName: "Türkçe", correct: 28, wrong: 8, net: 26 },
        { id: "exam_sub_10", subjectName: "Matematik", correct: 16, wrong: 9, net: 13.75 },
        { id: "exam_sub_11", subjectName: "Fen", correct: 11, wrong: 6, net: 9.5 },
        { id: "exam_sub_12", subjectName: "Sosyal", correct: 13, wrong: 5, net: 11.75 },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "exam_mem_tyt_2_s2",
      studentId: DEMO_STUDENT_002_ID,
      examType: "TYT",
      label: "TYT Deneme 2",
      takenAt: newerTakenAt,
      totalNet: 72.25,
      subjects: [
        { id: "exam_sub_13", subjectName: "Türkçe", correct: 31, wrong: 7, net: 29.25 },
        { id: "exam_sub_14", subjectName: "Matematik", correct: 18, wrong: 8, net: 16 },
        { id: "exam_sub_15", subjectName: "Fen", correct: 12, wrong: 5, net: 10.75 },
        { id: "exam_sub_16", subjectName: "Sosyal", correct: 14, wrong: 4, net: 13 },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  );
}

export function resetExamResultsForTests() {
  examResults.length = 0;
}

export function listExamResultsForStudent(studentId: string): ExamResultRecord[] {
  seedIfEmpty();
  return examResults
    .filter((exam) => exam.studentId === studentId)
    .sort((left, right) => new Date(right.takenAt).getTime() - new Date(left.takenAt).getTime());
}

export function listExamResultsForStudents(studentIds: string[]): ExamResultRecord[] {
  seedIfEmpty();
  const idSet = new Set(studentIds);
  return examResults
    .filter((exam) => idSet.has(exam.studentId))
    .sort((left, right) => new Date(right.takenAt).getTime() - new Date(left.takenAt).getTime());
}

export function getExamTrendSummaryForStudent(studentId: string): ExamTrendSummary {
  return buildExamTrendSummary(listExamResultsForStudent(studentId));
}

export function getExamTrendSummaryForStudents(studentIds: string[]): ExamTrendSummary {
  return buildExamTrendSummary(listExamResultsForStudents(studentIds));
}

function computeSubjectNet(correct: number, wrong: number): number {
  return correct - wrong / 4;
}

function computeTotalNet(subjects: Array<{ correct: number; wrong: number }>): number {
  return subjects.reduce((total, subject) => total + computeSubjectNet(subject.correct, subject.wrong), 0);
}

export function createExamResult(input: import("@uyanik/database").CreateExamResultInput): ExamResultRecord {
  seedIfEmpty();
  const timestamp = nowIso();
  const subjects = input.subjects.map((subject, index) => ({
    id: `exam_sub_${Date.now()}_${index}`,
    subjectName: subject.subjectName.trim(),
    correct: subject.correct,
    wrong: subject.wrong,
    net: computeSubjectNet(subject.correct, subject.wrong),
  }));
  const totalNet = computeTotalNet(input.subjects);

  const exam: ExamResultRecord = {
    id: `exam_${examResults.length + 1}`,
    studentId: input.studentId,
    examType: input.examType,
    label: input.label ?? null,
    takenAt: input.takenAt,
    totalNet,
    subjects,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  examResults.push(exam);
  return exam;
}
