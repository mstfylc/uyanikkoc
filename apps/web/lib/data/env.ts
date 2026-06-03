export function useMemoryStore(): boolean {
  const flag = process.env.DEMO_AUTH_ALLOW_IN_MEMORY;
  return flag !== "false" && flag !== "0";
}

/** Production ortamında demo-memory açıksa açık hata fırlatır. */
export function assertProductionMemoryPolicy(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (useMemoryStore()) {
    throw new Error(
      "DEMO_AUTH_ALLOW_IN_MEMORY must be false in production. Demo memory store is not permitted.",
    );
  }
}

export function shouldUseDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim()) && !useMemoryStore();
}
