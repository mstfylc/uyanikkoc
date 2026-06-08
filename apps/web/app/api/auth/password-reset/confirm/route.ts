import { NextResponse } from "next/server";

import { confirmPasswordReset } from "@/server/services/password-reset.service";

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { token?: unknown; password?: unknown };
  const token = str(body.token);
  const password = str(body.password);

  if (!token || password.length < 6) {
    return NextResponse.json({ error: "Token veya sifre gecersiz." }, { status: 400 });
  }

  const ok = await confirmPasswordReset(token, password);
  if (!ok) {
    return NextResponse.json({ error: "Sifre sifirlama baglantisi gecersiz veya suresi dolmus." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
