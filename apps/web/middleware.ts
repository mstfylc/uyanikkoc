import type { AppRole } from "@uyanik/tokens";
import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

import { getUnauthorizedRedirect, isPublicPath } from "./lib/rbac";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  const session = token?.role
    ? {
        user: {
          id: token.sub ?? "",
          role: token.role as AppRole,
          organizationId: (token.organizationId as string | null | undefined) ?? null,
          branchId: (token.branchId as string | null | undefined) ?? null,
          studentId: (token.studentId as string | null | undefined) ?? null,
          coachId: (token.coachId as string | null | undefined) ?? null,
          parentId: (token.parentId as string | null | undefined) ?? null,
        },
      }
    : null;

  const redirectTo = getUnauthorizedRedirect(pathname, session);
  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
