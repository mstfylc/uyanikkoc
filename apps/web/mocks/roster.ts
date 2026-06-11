import type { CoachRosterEntry } from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";

export const DEMO_STUDENT_002_ID = "student_002";
export const DEMO_PARENT_002_ID = "parent_002";

const ROSTER_BY_COACH: Record<string, CoachRosterEntry[]> = {
  coach_001: [
    {
      studentId: DEMO_STUDENT_ID,
      displayName: "Demo Öğrenci",
      email: "student@uyanik.local",
    },
    {
      studentId: DEMO_STUDENT_002_ID,
      displayName: "Demo Öğrenci 2",
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

export function resolveCoachIdForStudent(studentId: string): string | null {
  for (const [coachId, entries] of Object.entries(ROSTER_BY_COACH)) {
    if (entries.some((entry) => entry.studentId === studentId)) {
      return coachId;
    }
  }
  return null;
}

export function addCoachStudent(
  coachId: string,
  input: { displayName: string; email: string },
): CoachRosterEntry {
  const displayName = input.displayName.trim();
  const email = input.email.trim().toLowerCase();
  const roster = ROSTER_BY_COACH[coachId] ?? (ROSTER_BY_COACH[coachId] = []);

  const duplicate = roster.find((entry) => entry.email.toLowerCase() === email);
  if (duplicate) {
    throw new Error("Bu e-posta zaten kadroda.");
  }

  const entry: CoachRosterEntry = {
    studentId: `student_${Date.now()}`,
    displayName,
    email,
  };

  roster.push(entry);
  return entry;
}
