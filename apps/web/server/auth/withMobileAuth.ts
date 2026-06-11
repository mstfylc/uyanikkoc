import { type NextRequest, NextResponse } from "next/server";
import { verifyAccess, type AuthRole } from "@uyanik/shared/token";
import { dbRoleToAppRole } from "@uyanik/tokens";

import { shouldUseDatabase } from "@/lib/data/env";

import { accessSecret } from "./mobile-tokens";

export interface MobileUser {
  id: string;
  role: AuthRole;
  email?: string;
  studentId?: string | null;
  coachId?: string | null;
  parentId?: string | null;
}

export interface MobileAuthContext {
  user: MobileUser;
}

export type MobileRouteHandler = (req: NextRequest, ctx: MobileAuthContext) => Promise<NextResponse> | NextResponse;

async function resolveCurrentMobileUser(user: MobileUser): Promise<MobileUser | null> {
  if (!shouldUseDatabase()) {
    return user;
  }

  const { authRepository } = await import("@uyanik/database");
  const record = await authRepository.findUserById(user.id);
  if (!record || dbRoleToAppRole[record.role] !== user.role) {
    return null;
  }

  return {
    id: record.id,
    role: user.role,
    email: record.email,
    studentId: record.studentId,
    coachId: record.coachId,
    parentId: record.parentId,
  };
}

export function withMobileAuth(handler: MobileRouteHandler, opts?: { role?: AuthRole }) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const header = req.headers.get("authorization") ?? "";
    const match = /^Bearer (.+)$/.exec(header);
    if (!match) {
      return NextResponse.json({ message: "Yetkisiz", code: "no_token" }, { status: 401 });
    }

    const payload = verifyAccess(match[1], accessSecret());
    if (!payload) {
      return NextResponse.json({ message: "Oturum suresi doldu", code: "token_expired" }, { status: 401 });
    }

    if (opts?.role && payload.role !== opts.role) {
      return NextResponse.json({ message: "Erisim yok", code: "forbidden" }, { status: 403 });
    }

    const currentUser = await resolveCurrentMobileUser({ id: payload.sub, role: payload.role });
    if (!currentUser) {
      return NextResponse.json({ message: "Oturum suresi doldu", code: "token_expired" }, { status: 401 });
    }

    return handler(req, { user: currentUser });
  };
}
