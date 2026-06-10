import type { AppRole } from "@uyanik/tokens";
import { dbRoleToAppRole } from "@uyanik/tokens";
import { SignJWT, jwtVerify } from "jose";

import { shouldUseDatabase } from "@/lib/data/env";

export type MobileAuthPayload = {
  sub: string;
  role: AppRole;
  organizationId: string | null;
  branchId: string | null;
  studentId: string | null;
  coachId: string | null;
  parentId: string | null;
  email: string;
};

const MOBILE_TOKEN_TTL = "30d";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required for mobile tokens");
  }
  return new TextEncoder().encode(secret);
}

export async function signMobileToken(payload: MobileAuthPayload): Promise<string> {
  return new SignJWT({
    role: payload.role,
    organizationId: payload.organizationId,
    branchId: payload.branchId,
    studentId: payload.studentId,
    coachId: payload.coachId,
    parentId: payload.parentId,
    email: payload.email,
    kind: "mobile",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(MOBILE_TOKEN_TTL)
    .sign(getSecret());
}

export async function verifyMobileToken(token: string): Promise<MobileAuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.kind !== "mobile" || typeof payload.sub !== "string") {
      return null;
    }

    return {
      sub: payload.sub,
      role: payload.role as AppRole,
      organizationId: (payload.organizationId as string | null | undefined) ?? null,
      branchId: (payload.branchId as string | null | undefined) ?? null,
      studentId: (payload.studentId as string | null | undefined) ?? null,
      coachId: (payload.coachId as string | null | undefined) ?? null,
      parentId: (payload.parentId as string | null | undefined) ?? null,
      email: String(payload.email ?? ""),
    };
  } catch {
    return null;
  }
}

export async function verifyCurrentMobileToken(token: string): Promise<MobileAuthPayload | null> {
  const payload = await verifyMobileToken(token);
  if (!payload) {
    return null;
  }

  if (!shouldUseDatabase()) {
    return payload;
  }

  const { authRepository } = await import("@uyanik/database");
  const user = await authRepository.findUserById(payload.sub);
  if (!user) {
    return null;
  }

  const role = dbRoleToAppRole[user.role];
  if (
    role !== payload.role ||
    user.email !== payload.email ||
    user.organizationId !== payload.organizationId ||
    user.branchId !== payload.branchId ||
    (user.studentId ?? null) !== payload.studentId ||
    (user.coachId ?? null) !== payload.coachId ||
    (user.parentId ?? null) !== payload.parentId
  ) {
    return null;
  }

  return payload;
}
