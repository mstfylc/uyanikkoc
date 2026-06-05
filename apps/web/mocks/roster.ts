import type { CoachRosterEntry } from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";

export const DEMO_STUDENT_002_ID = "student_002";
export const DEMO_PARENT_002_ID = "parent_002";

const ROSTER_BY_COACH: Record<string, CoachRosterEntry[]> = {
  coach_001: [
    {
      studentId: DEMO_STUDENT_ID,
      displayName: "Demo Ogrenci",
      email: "student@uyanik.local",
    },
    {
      studentId: DEMO_STUDENT_002_ID,
      displayName: "Demo Ogrenci 2",
      email: "student2@uyanik.local",
    },
  ],
};

const PARENT_BY_STUDENT: Record<string, string> = {
  [DEMO_STUDENT_ID]: "parent_001",
  [DEMO_STUDENT_002_ID]: DEMO_PARENT_002_ID,
};

export function listCoachStudents(coachId: string): CoachRosterEntry[] {
  return ROSTER_BY_COACH[coachId] ?? [];
}

export function coachHasStudent(coachId: string, studentId: string): boolean {
  return listCoachStudents(coachId).some((entry) => entry.studentId === studentId);
}

export function resolveParentIdForStudent(studentId: string): string | null {
  return PARENT_BY_STUDENT[studentId] ?? null;
}
