import type { AppRole } from "@uyanik/tokens";
import { NextResponse, type NextRequest } from "next/server";

import { assertProductionMemoryPolicy } from "@/lib/data/env";
import { verifyMobileToken } from "@/lib/auth/mobile-token";

import { auth } from "../../auth";
import type { SessionRoleSnapshot } from "../rbac";

export type ApiAuthContext = {
  session: SessionRoleSnapshot;
};

export type ApiRouteHandler = (
  req: NextRequest,
  ctx: ApiAuthContext,
) => Promise<NextResponse> | NextResponse;

async function sessionFromBearer(req: NextRequest): Promise<SessionRoleSnapshot | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  const payload = await verifyMobileToken(token);
  if (!payload) {
    return null;
  }

  return {
    user: {
      id: payload.sub,
      role: payload.role,
      organizationId: payload.organizationId,
      branchId: payload.branchId,
      studentId: payload.studentId,
      coachId: payload.coachId,
      parentId: payload.parentId,
    },
  };
}

export async function requireAuth(
  req: NextRequest,
  allowedRoles: AppRole[],
): Promise<{ session: SessionRoleSnapshot } | NextResponse> {
  assertProductionMemoryPolicy();

  const bearerSession = await sessionFromBearer(req);
  if (bearerSession) {
    if (!allowedRoles.includes(bearerSession.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return { session: bearerSession };
  }

  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return {
    session: {
      user: {
        id: session.user.id,
        role: session.user.role,
        organizationId: session.user.organizationId ?? null,
        branchId: session.user.branchId ?? null,
        studentId: session.user.studentId ?? null,
        coachId: session.user.coachId ?? null,
        parentId: session.user.parentId ?? null,
      },
    },
  };
}

export function withApiAuth(allowedRoles: AppRole[], handler: ApiRouteHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authResult = await requireAuth(req, allowedRoles);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    return handler(req, { session: authResult.session });
  };
}
