import { NextResponse, type NextRequest } from "next/server";
import { refreshSession, revokeRefresh } from "@/server/services/mobile-auth.service";
import { mobileError, readJson, str } from "@/server/auth/mobile-http";

// M2 — POST /api/auth/refresh  body: { refreshToken } → { accessToken, refreshToken }
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await readJson(req);
    const result = await refreshSession(str(body.refreshToken));
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return mobileError(err);
  }
}

// Çıkış — DELETE /api/auth/refresh  body: { refreshToken } → token iptal
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await readJson(req);
    await revokeRefresh(str(body.refreshToken));
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return mobileError(err);
  }
}
