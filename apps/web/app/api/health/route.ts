import { NextResponse } from "next/server";

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
  const authSecret = (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET)?.trim()
    ? "ok"
    : "missing";
  return NextResponse.json({ status: "ok", database, authSecret });
}
