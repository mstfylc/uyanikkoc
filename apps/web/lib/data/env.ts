export function useMemoryStore(): boolean {
  const flag = process.env.DEMO_AUTH_ALLOW_IN_MEMORY;
  return flag !== "false" && flag !== "0";
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** Vercel preview/demo deploy'ları bellek modunu bilinçli kullanır. */
export function isVercelDemoDeploy(): boolean {
  return process.env.VERCEL === "1" && useMemoryStore();
}

/** Production ortamında demo-memory açıksa açık hata fırlatır (Vercel demo hariç). */
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

export function shouldUseDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim()) && !useMemoryStore();
}
