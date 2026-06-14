import { prisma } from "../client";
import type { AuthUserRecord } from "../types";

export type LoginAttemptScope = "web_login" | "password_reset";

export type OtpChallengeRecord = {
  phone: string;
  codeHash: string;
  attempts: number;
  consumedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
};

export type RefreshTokenRecord = {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
};

export async function findUserByEmail(email: string): Promise<AuthUserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      studentProfile: true,
      coachProfile: true,
      parentProfile: true,
    },
  });

  if (!user) {
    return null;
  }
  if (user.status !== "active" || user.deletedAt) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    passwordHash: user.passwordHash,
    role: user.role,
    organizationId: user.organizationId,
    branchId: user.branchId,
    studentId: user.studentProfile?.id ?? null,
    coachId: user.coachProfile?.id ?? null,
    parentId: user.parentProfile?.id ?? null,
  };
}

export async function findUserById(id: string): Promise<AuthUserRecord | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      studentProfile: true,
      coachProfile: true,
      parentProfile: true,
    },
  });

  if (!user) {
    return null;
  }
  if (user.status !== "active" || user.deletedAt) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    passwordHash: user.passwordHash,
    role: user.role,
    organizationId: user.organizationId,
    branchId: user.branchId,
    studentId: user.studentProfile?.id ?? null,
    coachId: user.coachProfile?.id ?? null,
    parentId: user.parentProfile?.id ?? null,
  };
}

export async function countRecentLoginAttempts(input: {
  scope: LoginAttemptScope;
  email: string;
  ip: string;
  since: Date;
  now: Date;
}): Promise<number> {
  await prisma.loginAttempt.deleteMany({
    where: { expiresAt: { lte: input.now } },
  });

  return prisma.loginAttempt.count({
    where: {
      scope: input.scope,
      email: input.email,
      ip: input.ip,
      createdAt: { gte: input.since },
      expiresAt: { gt: input.now },
    },
  });
}

export async function recordLoginAttempt(input: {
  scope: LoginAttemptScope;
  email: string;
  ip: string;
  expiresAt: Date;
}): Promise<void> {
  await prisma.loginAttempt.create({
    data: {
      scope: input.scope,
      email: input.email,
      ip: input.ip,
      expiresAt: input.expiresAt,
    },
  });
}

export async function clearLoginAttempts(input: {
  scope: LoginAttemptScope;
  email: string;
  ip: string;
}): Promise<void> {
  await prisma.loginAttempt.deleteMany({
    where: {
      scope: input.scope,
      email: input.email,
      ip: input.ip,
    },
  });
}

export async function getOtpChallenge(phone: string): Promise<OtpChallengeRecord | null> {
  const row = await prisma.otpChallenge.findUnique({ where: { phone } });
  return row
    ? {
        phone: row.phone,
        codeHash: row.codeHash,
        attempts: row.attempts,
        consumedAt: row.consumedAt,
        expiresAt: row.expiresAt,
        createdAt: row.createdAt,
      }
    : null;
}

export async function upsertOtpChallenge(input: {
  phone: string;
  codeHash: string;
  expiresAt: Date;
  createdAt: Date;
}): Promise<OtpChallengeRecord> {
  const row = await prisma.otpChallenge.upsert({
    where: { phone: input.phone },
    create: {
      phone: input.phone,
      codeHash: input.codeHash,
      attempts: 0,
      consumedAt: null,
      expiresAt: input.expiresAt,
      createdAt: input.createdAt,
    },
    update: {
      codeHash: input.codeHash,
      attempts: 0,
      consumedAt: null,
      expiresAt: input.expiresAt,
      createdAt: input.createdAt,
    },
  });

  return {
    phone: row.phone,
    codeHash: row.codeHash,
    attempts: row.attempts,
    consumedAt: row.consumedAt,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}

export async function incrementOtpAttempts(phone: string): Promise<void> {
  await prisma.otpChallenge.update({
    where: { phone },
    data: { attempts: { increment: 1 } },
  });
}

export async function consumeOtpChallenge(phone: string, consumedAt: Date): Promise<void> {
  await prisma.otpChallenge.update({
    where: { phone },
    data: { consumedAt },
  });
}

export async function deleteOtpChallenge(phone: string): Promise<void> {
  await prisma.otpChallenge.deleteMany({ where: { phone } });
}

export async function createRefreshToken(input: {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}): Promise<void> {
  await prisma.refreshToken.create({
    data: {
      tokenHash: input.tokenHash,
      userId: input.userId,
      expiresAt: input.expiresAt,
    },
  });
}

export async function findRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | null> {
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  return row
    ? {
        tokenHash: row.tokenHash,
        userId: row.userId,
        expiresAt: row.expiresAt,
      }
    : null;
}

export async function deleteRefreshToken(tokenHash: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
}

export async function purgeExpiredAuthArtifacts(now: Date): Promise<{
  refreshTokens: number;
  passwordResetTokens: number;
  otpChallenges: number;
  total: number;
}> {
  const [refreshTokens, passwordResetTokens, otpChallenges] = await prisma.$transaction([
    prisma.refreshToken.deleteMany({
      where: { expiresAt: { lte: now } },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lte: now } },
    }),
    prisma.otpChallenge.deleteMany({
      where: { expiresAt: { lte: now } },
    }),
  ]);

  return {
    refreshTokens: refreshTokens.count,
    passwordResetTokens: passwordResetTokens.count,
    otpChallenges: otpChallenges.count,
    total: refreshTokens.count + passwordResetTokens.count + otpChallenges.count,
  };
}

export async function upsertDeviceToken(input: {
  userId: string;
  token: string;
  platform: string;
}): Promise<void> {
  await prisma.deviceToken.upsert({
    where: { userId_token: { userId: input.userId, token: input.token } },
    create: {
      userId: input.userId,
      token: input.token,
      platform: input.platform,
    },
    update: {
      platform: input.platform,
    },
  });
}

export async function deleteDeviceToken(input: { userId: string; token: string }): Promise<void> {
  await prisma.deviceToken.deleteMany({
    where: {
      userId: input.userId,
      token: input.token,
    },
  });
}

export async function createPasswordResetToken(input: {
  email: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<{ userId: string; email: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true, status: true, deletedAt: true },
  });

  if (!user || user.status !== "active" || user.deletedAt) {
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
    include: { user: { select: { status: true, deletedAt: true } } },
  });

  if (!token || token.usedAt || token.expiresAt <= now || token.user.status !== "active" || token.user.deletedAt) {
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

export async function updateUserPasswordById(input: {
  userId: string;
  passwordHash: string;
}): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, status: true, deletedAt: true },
  });

  if (!user || user.status !== "active" || user.deletedAt) {
    return false;
  }

  await prisma.user.update({
    where: { id: input.userId },
    data: { passwordHash: input.passwordHash },
  });

  return true;
}

export async function updateUserEmailById(input: {
  userId: string;
  email: string;
}): Promise<"updated" | "not_found" | "email_taken"> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, status: true, deletedAt: true },
  });

  if (!user || user.status !== "active" || user.deletedAt) {
    return "not_found";
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing && existing.id !== input.userId) {
    return "email_taken";
  }

  await prisma.user.update({
    where: { id: input.userId },
    data: { email: normalizedEmail },
  });

  return "updated";
}

export async function softDeleteUserById(input: {
  userId: string;
  deletedById?: string | null;
  reason?: string | null;
  now?: Date;
  retentionDays?: number;
}): Promise<boolean> {
  const now = input.now ?? new Date();
  const retentionDays = input.retentionDays ?? 90;
  const restoreUntil = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000);
  const result = await prisma.user.updateMany({
    where: { id: input.userId, status: { not: "deleted" } },
    data: {
      status: "deleted",
      deletedAt: now,
      deletedById: input.deletedById ?? null,
      deleteReason: input.reason ?? null,
      restoreUntil,
    },
  });

  return result.count > 0;
}

export async function restoreUserById(userId: string): Promise<boolean> {
  const result = await prisma.user.updateMany({
    where: { id: userId, status: "deleted" },
    data: {
      status: "active",
      deletedAt: null,
      deletedById: null,
      deleteReason: null,
      restoreUntil: null,
    },
  });

  return result.count > 0;
}
