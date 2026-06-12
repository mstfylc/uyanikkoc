import { NextResponse } from "next/server";

import { getAuthEnvDiagnostics } from "@/lib/auth/runtime-env";

export async function GET() {
  const diagnostics = getAuthEnvDiagnostics();
  return NextResponse.json({ status: "ok", authSecret: diagnostics.authSecret });
}
