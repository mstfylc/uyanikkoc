import { PrismaClient } from "@prisma/client";

const globalStore = globalThis as typeof globalThis & {
  __uyanikPrisma?: PrismaClient;
};

export const prisma = globalStore.__uyanikPrisma ?? new PrismaClient();

globalStore.__uyanikPrisma = prisma;

function getDatabaseHost(value: string | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

function warnIfProductionDatabaseIsUnpooled(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const host = getDatabaseHost(process.env.DATABASE_URL);
  if (!host || host.includes("-pooler")) {
    return;
  }

  console.warn(
    "DATABASE_URL should use the pooled endpoint in production runtime. Use the direct/unpooled URL only for migrations.",
  );
}

warnIfProductionDatabaseIsUnpooled();

export function useMemoryStore(): boolean {
  const flag = process.env.DEMO_AUTH_ALLOW_IN_MEMORY;
  return flag !== "false" && flag !== "0";
}

export function isVercelDemoDeploy(): boolean {
  return process.env.VERCEL === "1" && useMemoryStore();
}

export function assertProductionMemoryPolicy(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (!useMemoryStore()) {
    return;
  }

  if (isVercelDemoDeploy()) {
    return;
  }

  throw new Error(
    "DEMO_AUTH_ALLOW_IN_MEMORY must be false in production. Demo memory store is not permitted.",
  );
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function shouldUseDatabase(): boolean {
  return isDatabaseConfigured() && !useMemoryStore();
}
