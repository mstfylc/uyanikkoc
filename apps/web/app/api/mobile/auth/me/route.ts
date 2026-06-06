import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/api-guard";
import { verifyMobileToken } from "@/lib/auth/mobile-token";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, ["student"]);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
  const payload = token ? await verifyMobileToken(token) : null;

  return NextResponse.json(
    {
      user: {
        ...authResult.session.user,
        email: payload?.email ?? "",
      },
    },
    { status: 200 },
  );
}
