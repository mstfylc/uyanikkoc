import { NextResponse } from "next/server";

import { requestPasswordReset } from "@/server/services/password-reset.service";

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: unknown };
  const email = str(body.email).toLowerCase();

  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "Gecerli bir e-posta girin." }, { status: 400 });
  }

  const result = await requestPasswordReset(email);
  return NextResponse.json({
    ok: true,
    message: "Bu e-posta kayitliysa sifre sifirlama baglantisi olusturuldu.",
    resetUrl: result.resetUrl,
  });
}
