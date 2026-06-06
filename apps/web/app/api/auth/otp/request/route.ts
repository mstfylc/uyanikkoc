import { NextResponse, type NextRequest } from "next/server";
import { requestOtp } from "@/server/services/mobile-auth.service";
import { mobileError, readJson, str } from "@/server/auth/mobile-http";

// M1 — POST /api/auth/otp/request  body: { phone } → { resendInMs }
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await readJson(req);
    const result = await requestOtp(str(body.phone));
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return mobileError(err);
  }
}
