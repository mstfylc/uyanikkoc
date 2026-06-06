import type { CoachRosterEntry, ExamResultRecord } from "@uyanik/database";

import {
  estimateTytScore,
  EXAM_CAT_ORDER,
  subjectToExamCategory,
  type ExamCategory,
} from "@/lib/design/exam-categories";

export type CoachExamCategoryStats = {
  correct: number;
  wrong: number;
  net: number;
};

export type CoachExamStudentRow = {
  studentId: string;
  displayName: string;
  branch: string;
  studentNumber: string | null;
  byCat: Record<ExamCategory, CoachExamCategoryStats>;
  subjects: ExamResultRecord["subjects"];
  totalNet: number;
  score: number | null;
  rank: number | null;
};

export type CoachExamSession = {
  id: string;
  name: string;
  date: string;
  takenAt: string;
  examType: ExamResultRecord["examType"];
  students: CoachExamStudentRow[];
};

function sessionKey(exam: ExamResultRecord): string {
  const date = exam.takenAt.slice(0, 10);
  const label = exam.label?.trim() || exam.examType;
  return `${exam.examType}|${date}|${label}`;
}

function formatSessionDate(takenAt: string): string {
  return new Date(takenAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function emptyCategoryStats(): Record<ExamCategory, CoachExamCategoryStats> {
  return {
    Türkçe: { correct: 0, wrong: 0, net: 0 },
    Sosyal: { correct: 0, wrong: 0, net: 0 },
    Matematik: { correct: 0, wrong: 0, net: 0 },
    Fen: { correct: 0, wrong: 0, net: 0 },
  };
}

function branchForStudent(studentId: string, index: number): string {
  const suffix = String.fromCharCode(65 + (index % 3));
  const grade = 11 + (index % 2);
  return `${grade}-${suffix}`;
}

function studentNumberForIndex(index: number): string {
  return String(1200 + index);
}

function buildStudentRow(
  exam: ExamResultRecord,
  rosterEntry: CoachRosterEntry | undefined,
  rosterIndex: number,
): CoachExamStudentRow {
  const byCat = emptyCategoryStats();

  for (const subject of exam.subjects) {
    const category = subjectToExamCategory(subject.subjectName);
    if (!category) {
      continue;
    }
    byCat[category].correct += subject.correct;
    byCat[category].wrong += subject.wrong;
    byCat[category].net += subject.net;
  }

  return {
    studentId: exam.studentId,
    displayName: rosterEntry?.displayName ?? exam.studentId,
    branch: branchForStudent(exam.studentId, rosterIndex),
    studentNumber: studentNumberForIndex(rosterIndex),
    byCat,
    subjects: exam.subjects,
    totalNet: exam.totalNet,
    score: exam.examType === "TYT" ? estimateTytScore(exam.totalNet) : null,
    rank: null,
  };
}

export function buildCoachExamSessions(
  exams: ExamResultRecord[],
  roster: CoachRosterEntry[],
): CoachExamSession[] {
  const rosterById = new Map(roster.map((entry, index) => [entry.studentId, { entry, index }]));
  const grouped = new Map<string, ExamResultRecord[]>();

  for (const exam of exams) {
    const key = sessionKey(exam);
    const bucket = grouped.get(key) ?? [];
    bucket.push(exam);
    grouped.set(key, bucket);
  }

  const sessions: CoachExamSession[] = [];

  for (const [key, sessionExams] of grouped.entries()) {
    const sample = sessionExams[0];
    const students = sessionExams
      .map((exam) => {
        const rosterInfo = rosterById.get(exam.studentId);
        return buildStudentRow(exam, rosterInfo?.entry, rosterInfo?.index ?? 0);
      })
      .sort((left, right) => right.totalNet - left.totalNet);

    students.forEach((student, index) => {
      student.rank = index + 1;
    });

    sessions.push({
      id: key,
      name: sample.label?.trim() || sample.examType,
      date: formatSessionDate(sample.takenAt),
      takenAt: sample.takenAt,
      examType: sample.examType,
      students,
    });
  }

  return sessions.sort(
    (left, right) => new Date(right.takenAt).getTime() - new Date(left.takenAt).getTime(),
  );
}

export function averageCategoryNets(students: CoachExamStudentRow[]): Record<ExamCategory, number> {
  if (students.length === 0) {
    return {
      Türkçe: 0,
      Sosyal: 0,
      Matematik: 0,
      Fen: 0,
    };
  }

  const totals = emptyCategoryStats();
  for (const student of students) {
    for (const category of EXAM_CAT_ORDER) {
      totals[category].net += student.byCat[category].net;
    }
  }

  return {
    Türkçe: totals.Türkçe.net / students.length,
    Sosyal: totals.Sosyal.net / students.length,
    Matematik: totals.Matematik.net / students.length,
    Fen: totals.Fen.net / students.length,
  };
}

export function buildClassExamTrend(sessions: CoachExamSession[]): Array<{ label: string; value: number }> {
  const chronological = [...sessions].sort(
    (left, right) => new Date(left.takenAt).getTime() - new Date(right.takenAt).getTime(),
  );

  return chronological.map((session) => {
    const avg =
      session.students.reduce((sum, student) => sum + student.totalNet, 0) / session.students.length;
    return {
      label: session.name.replace(/^TYT\s+/i, "D"),
      value: Math.round(avg * 10) / 10,
    };
  });
}
