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
