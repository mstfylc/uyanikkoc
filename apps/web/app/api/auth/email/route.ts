import { NextResponse, type NextRequest } from "next/server";
import { loginEmail } from "@/server/services/mobile-auth.service";
import { mobileError, readJson, str } from "@/server/auth/mobile-http";

// M5 — POST /api/auth/email  body: { email, password } → { accessToken, refreshToken, user }
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await readJson(req);
    const result = await loginEmail(str(body.email), str(body.password));
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return mobileError(err);
  }
}
