import { NextResponse } from "next/server";
import { withMobileAuth } from "@/server/auth/withMobileAuth";
import { saveOdevResult, type OdevResult } from "@/server/services/mobile-student.service";
import { mobileError, readJson, str } from "@/server/auth/mobile-http";

function num(value: unknown): number {
  const n = typeof value === "number" ? value : parseInt(String(value ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

// POST /api/mobile/odev/result  body: { id, result: {d,y,b} | null } → { item }
export const POST = withMobileAuth(
  async (req, { user }) => {
    try {
      const body = await readJson(req);
      const id = str(body.id);
      if (!id) return NextResponse.json({ message: "id gerekli", code: "invalid_id" }, { status: 400 });

      const raw = body.result;
      let result: OdevResult | null = null;
      if (raw && typeof raw === "object") {
        const r = raw as Record<string, unknown>;
        result = { d: num(r.d), y: num(r.y), b: num(r.b) };
      }

      const item = await saveOdevResult(user.studentId ?? undefined, id, result);
      if (!item) return NextResponse.json({ message: "Ödev bulunamadı", code: "not_found" }, { status: 404 });
      return NextResponse.json({ item }, { status: 200 });
    } catch (err) {
      return mobileError(err);
    }
  },
  { role: "student" },
);
