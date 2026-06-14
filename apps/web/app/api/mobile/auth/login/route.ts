import { NextResponse } from "next/server";

import { clientIpFromHeaders } from "@/server/services/auth-rate-limit.service";
import { loginEmail, MobileAuthError } from "@/server/services/mobile-auth.service";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Invalid credentials payload" }, { status: 400 });
  }

  try {
    const result = await loginEmail(email, password, clientIpFromHeaders(req.headers));
    if (result.user.role !== "student") {
      return NextResponse.json({ error: "Mobile app currently supports student accounts only" }, { status: 403 });
    }

    return NextResponse.json(
      {
        token: result.accessToken,
        refreshToken: result.refreshToken,
        user: {
          id: result.user.id,
          email,
          role: "student",
          studentId: result.user.studentId ?? null,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    throw error;
  }
}
