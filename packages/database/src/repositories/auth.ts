import { prisma } from "../client";
import type { AuthUserRecord } from "../types";

export async function findUserByEmail(email: string): Promise<AuthUserRecord | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      studentProfile: true,
      coachProfile: true,
      parentProfile: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    organizationId: user.organizationId,
    branchId: user.branchId,
    studentId: user.studentProfile?.id ?? null,
    coachId: user.coachProfile?.id ?? null,
    parentId: user.parentProfile?.id ?? null,
  };
}

export async function createPasswordResetToken(input: {
  email: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<{ userId: string; email: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true },
  });

  if (!user) {
    return null;
  }

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    },
  });

  return { userId: user.id, email: user.email };
}

export async function resetPasswordWithToken(input: {
  tokenHash: string;
  passwordHash: string;
  now?: Date;
}): Promise<boolean> {
  const now = input.now ?? new Date();
  const token = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: input.tokenHash },
  });

  if (!token || token.usedAt || token.expiresAt <= now) {
    return false;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { passwordHash: input.passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: now },
    }),
  ]);

  return true;
}
