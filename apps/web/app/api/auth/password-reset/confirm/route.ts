import { NextResponse } from "next/server";

import { isPasswordAllowed, passwordPolicyMessage } from "@/lib/auth/password-policy";
import { confirmPasswordReset } from "@/server/services/password-reset.service";

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { token?: unknown; password?: unknown };
  const token = str(body.token);
  const password = str(body.password);

  if (!token || !isPasswordAllowed(password)) {
    return NextResponse.json({ error: `Token geçersiz veya ${passwordPolicyMessage()}` }, { status: 400 });
  }

  const ok = await confirmPasswordReset(token, password);
  if (!ok) {
    return NextResponse.json({ error: "Sifre sifirlama baglantisi gecersiz veya suresi dolmus." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
