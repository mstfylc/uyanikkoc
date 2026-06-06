import { prisma } from "../client";
import type { MotivationMessageRecord } from "../types";

function map(m: {
  id: string;
  studentId: string;
  coachId: string;
  body: string;
  createdAt: Date;
}): MotivationMessageRecord {
  return {
    id: m.id,
    studentId: m.studentId,
    coachId: m.coachId,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  };
}

export async function sendToStudents(
  coachId: string,
  studentIds: string[],
  body: string,
): Promise<number> {
  if (studentIds.length === 0) return 0;
  await prisma.$transaction([
    prisma.motivationMessage.createMany({
      data: studentIds.map((studentId) => ({ studentId, coachId, body })),
    }),
    prisma.notification.createMany({
      data: studentIds.map((studentId) => ({
        studentId,
        title: "Kocundan motivasyon",
        body,
      })),
    }),
  ]);
  return studentIds.length;
}

export async function latestForStudent(studentId: string): Promise<MotivationMessageRecord | null> {
  const message = await prisma.motivationMessage.findFirst({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });
  return message ? map(message) : null;
}
