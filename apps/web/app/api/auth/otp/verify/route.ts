import { NextResponse, type NextRequest } from "next/server";
import { verifyOtpCode } from "@/server/services/mobile-auth.service";
import { mobileError, readJson, str } from "@/server/auth/mobile-http";

// M1/M2 — POST /api/auth/otp/verify  body: { phone, code } → { accessToken, refreshToken, user }
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await readJson(req);
    const result = await verifyOtpCode(str(body.phone), str(body.code));
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return mobileError(err);
  }
}
