/** Mobil route'lar için ortak hata → yanıt dönüşümü ve gövde okuma. */
import { NextResponse, type NextRequest } from "next/server";
import { MobileAuthError } from "@/server/services/mobile-auth.service";

export function mobileError(err: unknown): NextResponse {
  if (err instanceof MobileAuthError) {
    return NextResponse.json({ message: err.message, code: err.code, ...err.extra }, { status: err.status });
  }
  console.error("[mobile] beklenmeyen hata:", err);
  return NextResponse.json({ message: "Sunucu hatası", code: "internal" }, { status: 500 });
}

export async function readJson(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    const body = (await req.json()) as unknown;
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}
