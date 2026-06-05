import { prisma } from "../client";
import type { CoachRosterEntry } from "../types";

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.replace(/[._-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function listCoachStudents(coachId: string): Promise<CoachRosterEntry[]> {
  const rows = await prisma.coachStudent.findMany({
    where: { coachId },
    include: {
      student: {
        include: {
          user: { select: { email: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => ({
    studentId: row.studentId,
    email: row.student.user.email,
    displayName: displayNameFromEmail(row.student.user.email),
  }));
}

export async function coachHasStudent(coachId: string, studentId: string): Promise<boolean> {
  const row = await prisma.coachStudent.findUnique({
    where: {
      coachId_studentId: { coachId, studentId },
    },
    select: { id: true },
  });

  return row !== null;
}

export async function resolveParentIdForStudent(studentId: string): Promise<string | null> {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { parentId: true },
  });

  return student?.parentId ?? null;
}

export async function resolveCoachIdForStudent(studentId: string): Promise<string | null> {
  const row = await prisma.coachStudent.findFirst({
    where: { studentId },
    select: { coachId: true },
    orderBy: { createdAt: "asc" },
  });

  return row?.coachId ?? null;
}
