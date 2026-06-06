import { describe, expect, it } from "vitest";

import { buildCoachExamSessions } from "@/lib/design/coach-exam-sessions";
import type { CoachRosterEntry, ExamResultRecord } from "@uyanik/database";

const roster: CoachRosterEntry[] = [
  { studentId: "student_a", displayName: "Ali Yilmaz", email: "a@test.local" },
  { studentId: "student_b", displayName: "Ayse Demir", email: "b@test.local" },
];

const exams: ExamResultRecord[] = [
  {
    id: "exam_1",
    studentId: "student_a",
    examType: "TYT",
    label: "TYT Deneme 1",
    takenAt: "2026-05-10T10:00:00.000Z",
    totalNet: 70,
    subjects: [
      { id: "s1", subjectName: "Turkce", correct: 30, wrong: 5, net: 28.75 },
      { id: "s2", subjectName: "Matematik", correct: 18, wrong: 8, net: 16 },
      { id: "s3", subjectName: "Fen", correct: 10, wrong: 5, net: 8.75 },
      { id: "s4", subjectName: "Sosyal", correct: 12, wrong: 4, net: 11 },
    ],
    createdAt: "2026-05-10T10:00:00.000Z",
    updatedAt: "2026-05-10T10:00:00.000Z",
  },
  {
    id: "exam_2",
    studentId: "student_b",
    examType: "TYT",
    label: "TYT Deneme 1",
    takenAt: "2026-05-10T10:00:00.000Z",
    totalNet: 62,
    subjects: [
      { id: "s5", subjectName: "Turkce", correct: 26, wrong: 7, net: 24.25 },
      { id: "s6", subjectName: "Matematik", correct: 15, wrong: 9, net: 12.75 },
      { id: "s7", subjectName: "Fen", correct: 9, wrong: 6, net: 7.5 },
      { id: "s8", subjectName: "Sosyal", correct: 11, wrong: 5, net: 9.75 },
    ],
    createdAt: "2026-05-10T10:00:00.000Z",
    updatedAt: "2026-05-10T10:00:00.000Z",
  },
];

describe("buildCoachExamSessions", () => {
  it("groups exams by label and date into class sessions", () => {
    const sessions = buildCoachExamSessions(exams, roster);

    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.students).toHaveLength(2);
    expect(sessions[0]?.students[0]?.displayName).toBe("Ali Yilmaz");
    expect(sessions[0]?.students[0]?.rank).toBe(1);
    expect(sessions[0]?.students[1]?.rank).toBe(2);
  });
});
