import { NextResponse } from "next/server";

import { getAuthEnvDiagnostics } from "@/lib/auth/runtime-env";
import { isDatabaseConfigured, shouldUseDatabase, useMemoryStore } from "@/lib/data/env";

async function resolveDatabaseStatus(): Promise<"ok" | "memory" | "down"> {
  if (!isDatabaseConfigured()) {
    return useMemoryStore() ? "memory" : "down";
  }

  if (shouldUseDatabase()) {
    try {
      const { prisma } = await import("@uyanik/database");
      await prisma.$queryRaw`SELECT 1`;
      return "ok";
    } catch {
      return "down";
    }
  }

  if (process.env.NODE_ENV === "production") {
    return "down";
  }

  return "memory";
}

export async function GET() {
  const database = await resolveDatabaseStatus();
  const auth = getAuthEnvDiagnostics();

  return NextResponse.json({
    status: "ok",
    database,
    authSecret: auth.authSecret,
    ...(auth.vercel
      ? {
          vercel: true,
          authUrlSet: auth.authUrlSet,
          nextAuthUrlSet: auth.nextAuthUrlSet,
        }
      : {}),
  });
}
