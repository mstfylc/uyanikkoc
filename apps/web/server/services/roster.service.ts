import type { CoachRosterEntry } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryRoster from "@/mocks/roster";

export async function listCoachRoster(coachId: string): Promise<CoachRosterEntry[]> {
  if (shouldUseDatabase()) {
    const { rosterRepository } = await import("@uyanik/database");
    return rosterRepository.listCoachStudents(coachId);
  }

  return memoryRoster.listCoachStudents(coachId);
}

export async function coachHasStudent(coachId: string, studentId: string): Promise<boolean> {
  if (shouldUseDatabase()) {
    const { rosterRepository } = await import("@uyanik/database");
    return rosterRepository.coachHasStudent(coachId, studentId);
  }

  return memoryRoster.coachHasStudent(coachId, studentId);
}

export async function resolveParentIdForStudent(studentId: string): Promise<string | null> {
  if (shouldUseDatabase()) {
    const { rosterRepository } = await import("@uyanik/database");
    return rosterRepository.resolveParentIdForStudent(studentId);
  }

  return memoryRoster.resolveParentIdForStudent(studentId);
}

export async function resolveCoachIdForStudent(studentId: string): Promise<string | null> {
  if (shouldUseDatabase()) {
    const { rosterRepository } = await import("@uyanik/database");
    return rosterRepository.resolveCoachIdForStudent(studentId);
  }

  return memoryRoster.resolveCoachIdForStudent(studentId);
}

export async function addCoachStudent(
  coachId: string,
  input: { displayName: string; email: string },
): Promise<CoachRosterEntry> {
  if (shouldUseDatabase()) {
    throw new Error("Add student is not supported in database mode yet");
  }

  return memoryRoster.addCoachStudent(coachId, input);
}

export async function listCoachStudentIds(coachId: string): Promise<string[]> {
  const roster = await listCoachRoster(coachId);
  return roster.map((entry) => entry.studentId);
}
