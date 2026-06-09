import { prisma } from "../client";
import type { CoachRosterEntry } from "../types";
import { randomUUID } from "node:crypto";

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

function nextId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

function parentEmailFor(studentEmail: string): string {
  const [local = "ogrenci", domain = "uyanik.local"] = studentEmail.split("@");
  return `veli+${local.replace(/[^a-z0-9._-]/gi, "").toLowerCase()}@${domain}`;
}

export async function addCoachStudent(
  coachId: string,
  input: { displayName: string; email: string; passwordHash: string },
): Promise<CoachRosterEntry> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();

  const coach = await prisma.coachProfile.findUnique({
    where: { id: coachId },
    include: {
      user: { select: { organizationId: true, branchId: true } },
    },
  });

  if (!coach) {
    throw new Error("Coach profile missing");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { studentProfile: true },
  });

  if (existingUser) {
    if (!existingUser.studentProfile) {
      throw new Error("Bu e-posta bir öğrenci hesabına bağlı değil.");
    }
    if (existingUser.organizationId !== coach.user.organizationId || existingUser.branchId !== coach.user.branchId) {
      throw new Error("Bu öğrenci farklı bir kurum/şubeye bağlı.");
    }

    await prisma.coachStudent.upsert({
      where: { coachId_studentId: { coachId, studentId: existingUser.studentProfile.id } },
      update: {},
      create: { coachId, studentId: existingUser.studentProfile.id },
    });

    return {
      studentId: existingUser.studentProfile.id,
      displayName,
      email: existingUser.email,
    };
  }

  const parentEmailBase = parentEmailFor(email);
  const parentEmail =
    (await prisma.user.findUnique({ where: { email: parentEmailBase }, select: { id: true } })) === null
      ? parentEmailBase
      : `veli+${randomUUID().slice(0, 8)}@uyanik.local`;

  const studentId = nextId("student");
  const parentId = nextId("parent");

  await prisma.$transaction(async (tx) => {
    const parentUser = await tx.user.create({
      data: {
        id: nextId("user_parent"),
        email: parentEmail,
        passwordHash: input.passwordHash,
        role: "PARENT",
        organizationId: coach.user.organizationId,
        branchId: coach.user.branchId,
      },
    });

    await tx.parentProfile.create({
      data: {
        id: parentId,
        userId: parentUser.id,
      },
    });

    const studentUser = await tx.user.create({
      data: {
        id: nextId("user_student"),
        email,
        passwordHash: input.passwordHash,
        role: "STUDENT",
        organizationId: coach.user.organizationId,
        branchId: coach.user.branchId,
      },
    });

    await tx.studentProfile.create({
      data: {
        id: studentId,
        userId: studentUser.id,
        parentId,
      },
    });

    await tx.coachStudent.create({
      data: {
        coachId,
        studentId,
      },
    });
  });

  return {
    studentId,
    displayName,
    email,
  };
}
