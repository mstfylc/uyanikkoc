import { NextResponse, type NextRequest } from "next/server";
import { withApiAuth } from "@/lib/auth/api-guard";
import { loginEmail } from "@/server/services/mobile-auth.service";
import { changeOwnEmail } from "@/server/services/email-change.service";
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

export const PATCH = withApiAuth(["admin", "branch", "coach", "student", "parent"], async (req, { session }) => {
  const body = (await req.json().catch(() => ({}))) as {
    currentPassword?: unknown;
    newEmail?: unknown;
  };

  const result = await changeOwnEmail({
    userId: session.user.id,
    currentPassword: str(body.currentPassword),
    newEmail: str(body.newEmail),
  });

  if (result === "changed") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (result === "invalid_email") {
    return NextResponse.json({ error: "Gecerli bir e-posta adresi girin." }, { status: 400 });
  }

  if (result === "email_taken") {
    return NextResponse.json({ error: "Bu e-posta adresi baska bir hesapta kullaniliyor." }, { status: 409 });
  }

  if (result === "not_available") {
    return NextResponse.json({ error: "E-posta degistirme icin veritabani baglantisi gerekir." }, { status: 503 });
  }

  return NextResponse.json({ error: "Mevcut sifre hatali." }, { status: 400 });
});
