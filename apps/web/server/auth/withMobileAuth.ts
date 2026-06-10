/**
 * Mobil Bearer token guard — web `withApiAuth` muadili (cookie yerine access JWT).
 * Süresi geçmiş/geçersiz token → 401 { code: "token_expired" } (client refresh tetikler).
 */
import { type NextRequest, NextResponse } from "next/server";
import { verifyAccess, type AuthRole } from "@uyanik/shared/token";
import { dbRoleToAppRole } from "@uyanik/tokens";

import { shouldUseDatabase } from "@/lib/data/env";

import { accessSecret } from "./mobile-tokens";

export interface MobileUser {
  id: string;
  role: AuthRole;
}
export interface MobileAuthContext {
  user: MobileUser;
}
export type MobileRouteHandler = (req: NextRequest, ctx: MobileAuthContext) => Promise<NextResponse> | NextResponse;

async function isCurrentMobileUser(user: MobileUser): Promise<boolean> {
  if (!shouldUseDatabase()) {
    return true;
  }

  const { authRepository } = await import("@uyanik/database");
  const record = await authRepository.findUserById(user.id);
  if (!record) {
    return false;
  }

  return dbRoleToAppRole[record.role] === user.role;
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
      return NextResponse.json({ message: "Oturum süresi doldu", code: "token_expired" }, { status: 401 });
    }

    if (opts?.role && payload.role !== opts.role) {
      return NextResponse.json({ message: "Erişim yok", code: "forbidden" }, { status: 403 });
    }

    const user = { id: payload.sub, role: payload.role };
    if (!(await isCurrentMobileUser(user))) {
      return NextResponse.json({ message: "Oturum sÃ¼resi doldu", code: "token_expired" }, { status: 401 });
    }

    return handler(req, { user });
  };
}
