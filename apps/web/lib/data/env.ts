export function useMemoryStore(): boolean {
  const flag = process.env.DEMO_AUTH_ALLOW_IN_MEMORY;
  return flag !== "false" && flag !== "0";
}

export function shouldUseDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim()) && !useMemoryStore();
}
