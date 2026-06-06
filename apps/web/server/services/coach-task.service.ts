import type { CoachTaskPriority, CoachTaskRecord, CreateCoachTaskInput } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryTasks from "@/mocks/coach-tasks";

async function repo() {
  const { coachTaskRepository } = await import("@uyanik/database");
  return coachTaskRepository;
}

const PRIORITY_RANK: Record<CoachTaskPriority, number> = { high: 0, med: 1, low: 2 };

/** Tamamlanmamis once, sonra oncelik, sonra en yeni. */
function sortTasks(tasks: CoachTaskRecord[]): CoachTaskRecord[] {
  return [...tasks].sort((left, right) => {
    if (left.done !== right.done) return left.done ? 1 : -1;
    const rank = PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority];
    if (rank !== 0) return rank;
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export async function listCoachTasks(coachId: string): Promise<CoachTaskRecord[]> {
  const tasks = shouldUseDatabase()
    ? await (await repo()).listForCoach(coachId)
    : memoryTasks.listForCoach(coachId);
  return sortTasks(tasks);
}

export async function createCoachTask(input: CreateCoachTaskInput): Promise<CoachTaskRecord> {
  if (shouldUseDatabase()) return (await repo()).create(input);
  return memoryTasks.create(input);
}

export async function setCoachTaskDone(
  coachId: string,
  id: string,
  done: boolean,
): Promise<CoachTaskRecord | null> {
  if (shouldUseDatabase()) return (await repo()).setDone(coachId, id, done);
  return memoryTasks.setDone(coachId, id, done);
}

export async function deleteCoachTask(coachId: string, id: string): Promise<boolean> {
  if (shouldUseDatabase()) return (await repo()).remove(coachId, id);
  return memoryTasks.remove(coachId, id);
}
