import { NextResponse } from "next/server";
import { withMobileAuth } from "@/server/auth/withMobileAuth";
import { buildMe } from "@/server/services/mobile-me.service";
import { mobileError } from "@/server/auth/mobile-http";

// M4 — GET /api/me (mobil bootstrap) → { user, student?, counts }
export const GET = withMobileAuth(async (_req, { user }) => {
  try {
    const me = await buildMe(user.id);
    return NextResponse.json(me, { status: 200 });
  } catch (err) {
    return mobileError(err);
  }
});
