export function useMemoryStore(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const flag = process.env.DEMO_AUTH_ALLOW_IN_MEMORY;
  return flag !== "false" && flag !== "0";
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function assertProductionMemoryPolicy(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const flag = process.env.DEMO_AUTH_ALLOW_IN_MEMORY;
  if (flag === "true" || flag === "1") {
    throw new Error(
      "DEMO_AUTH_ALLOW_IN_MEMORY must be false in production. Demo memory store is not permitted.",
    );
  }
}

export function assertProductionAuthEnv(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (secret?.trim()) {
    return;
  }

  throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required in production.");
}

export function shouldUseDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim()) && !useMemoryStore();
}
