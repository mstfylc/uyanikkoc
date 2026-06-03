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

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function shouldUseDatabase(): boolean {
  return isDatabaseConfigured() && !useMemoryStore();
}
