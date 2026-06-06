import { prisma } from "../client";
import type { CoachTaskPriority, CoachTaskRecord, CreateCoachTaskInput } from "../types";

type Row = {
  id: string;
  coachId: string;
  studentId: string | null;
  text: string;
  due: string | null;
  done: boolean;
  priority: CoachTaskPriority;
  createdAt: Date;
};

function map(t: Row): CoachTaskRecord {
  return {
    id: t.id,
    coachId: t.coachId,
    studentId: t.studentId,
    text: t.text,
    due: t.due,
    done: t.done,
    priority: t.priority,
    createdAt: t.createdAt.toISOString(),
  };
}

export async function listForCoach(coachId: string): Promise<CoachTaskRecord[]> {
  const rows = await prisma.coachTask.findMany({
    where: { coachId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(map);
}

export async function create(input: CreateCoachTaskInput): Promise<CoachTaskRecord> {
  const row = await prisma.coachTask.create({
    data: {
      coachId: input.coachId,
      studentId: input.studentId ?? null,
      text: input.text,
      due: input.due ?? null,
      priority: input.priority ?? "med",
    },
  });
  return map(row);
}

export async function setDone(
  coachId: string,
  id: string,
  done: boolean,
): Promise<CoachTaskRecord | null> {
  const result = await prisma.coachTask.updateMany({ where: { id, coachId }, data: { done } });
  if (result.count === 0) return null;
  const row = await prisma.coachTask.findUnique({ where: { id } });
  return row ? map(row) : null;
}

export async function remove(coachId: string, id: string): Promise<boolean> {
  const result = await prisma.coachTask.deleteMany({ where: { id, coachId } });
  return result.count > 0;
}
