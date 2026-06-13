import { NextResponse } from "next/server";

import { getAuthEnvDiagnostics } from "@/lib/auth/runtime-env";
import { shouldUseDatabase } from "@/lib/data/env";

type DatabaseHealth = "ok" | "error" | "skipped";

async function checkDatabase(): Promise<DatabaseHealth> {
  if (!shouldUseDatabase()) {
    return "skipped";
  }

  try {
    const { prisma } = await import("@uyanik/database");
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch {
    return "error";
  }
}

export async function GET() {
  const diagnostics = getAuthEnvDiagnostics();
  const database = await checkDatabase();
  const status = database === "error" ? "error" : "ok";

  return NextResponse.json(
    { status, authSecret: diagnostics.authSecret, database },
    { status: database === "error" ? 503 : 200 },
  );
}
