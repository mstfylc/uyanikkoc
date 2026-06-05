import { PrismaClient } from "@prisma/client";

const globalStore = globalThis as typeof globalThis & {
  __uyanikPrisma?: PrismaClient;
};

export const prisma = globalStore.__uyanikPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalStore.__uyanikPrisma = prisma;
}

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
