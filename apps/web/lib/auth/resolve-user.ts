import type { AuthUserRecord } from "@uyanik/database";
import type { DbRole } from "@uyanik/tokens";

import { shouldUseDatabase, assertProductionMemoryPolicy } from "@/lib/data/env";
import { demoUsers, type DemoUser } from "./demo-users";

function mapDemoUser(user: DemoUser): AuthUserRecord {
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role as DbRole,
    organizationId: user.organizationId,
    branchId: user.branchId,
    studentId: user.studentId ?? null,
    coachId: user.coachId ?? null,
    parentId: user.parentId ?? null,
  };
}

export async function resolveUserByEmail(email: string): Promise<AuthUserRecord | null> {
  if (!shouldUseDatabase()) {
    assertProductionMemoryPolicy();
    if (process.env.NODE_ENV === "production") {
      return null;
    }

    const user = demoUsers.find((demoUser) => demoUser.email === email);
    return user ? mapDemoUser(user) : null;
  }

  const { authRepository } = await import("@uyanik/database");
  return authRepository.findUserByEmail(email);
}
