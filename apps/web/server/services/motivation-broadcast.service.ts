import type { MotivationMessageRecord } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryMotivation from "@/mocks/motivation-broadcast";

async function repo() {
  const { motivationBroadcastRepository } = await import("@uyanik/database");
  return motivationBroadcastRepository;
}

export async function broadcastMotivation(
  coachId: string,
  studentIds: string[],
  body: string,
): Promise<number> {
  if (shouldUseDatabase()) return (await repo()).sendToStudents(coachId, studentIds, body);
  return memoryMotivation.sendToStudents(coachId, studentIds, body);
}

export async function latestMotivation(studentId: string): Promise<MotivationMessageRecord | null> {
  if (shouldUseDatabase()) return (await repo()).latestForStudent(studentId);
  return memoryMotivation.latestForStudent(studentId);
}
