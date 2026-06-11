import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { changeOwnPassword } from "@/server/services/password-change.service";

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export const POST = withApiAuth(["admin", "branch", "coach", "student", "parent"], async (req, { session }) => {
  const body = (await req.json().catch(() => ({}))) as {
    currentPassword?: unknown;
    newPassword?: unknown;
  };

  const result = await changeOwnPassword({
    userId: session.user.id,
    currentPassword: str(body.currentPassword),
    newPassword: str(body.newPassword),
  });

  if (result === "changed") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (result === "invalid_new") {
    return NextResponse.json({ error: "Yeni sifre en az 6 karakter olmali." }, { status: 400 });
  }

  if (result === "not_available") {
    return NextResponse.json({ error: "Sifre degistirme icin veritabani baglantisi gerekir." }, { status: 503 });
  }

  return NextResponse.json({ error: "Mevcut sifre hatali." }, { status: 400 });
});
