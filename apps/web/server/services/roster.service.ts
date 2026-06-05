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
