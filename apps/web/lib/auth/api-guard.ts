import type { AppRole } from "@uyanik/tokens";
import { NextResponse, type NextRequest } from "next/server";

import { assertProductionMemoryPolicy } from "@/lib/data/env";

import { auth } from "../../auth";
import type { SessionRoleSnapshot } from "../rbac";

export type ApiAuthContext = {
  session: SessionRoleSnapshot;
};

export type ApiRouteHandler = (
  req: NextRequest,
  ctx: ApiAuthContext,
) => Promise<NextResponse> | NextResponse;

export async function requireAuth(
  req: NextRequest,
  allowedRoles: AppRole[],
): Promise<{ session: SessionRoleSnapshot } | NextResponse> {
  void req;

  assertProductionMemoryPolicy();

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
