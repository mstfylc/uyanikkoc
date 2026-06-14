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

  const authSecret = (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET)?.trim();
  assertStrongSecret("AUTH_SECRET or NEXTAUTH_SECRET", authSecret);
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET?.trim();
  const otpPepper = process.env.OTP_PEPPER?.trim();
  assertStrongSecret("JWT_ACCESS_SECRET", jwtAccessSecret);
  assertStrongSecret("OTP_PEPPER", otpPepper);

  if (jwtAccessSecret === authSecret) {
    throw new Error("JWT_ACCESS_SECRET must be different from AUTH_SECRET/NEXTAUTH_SECRET in production.");
  }

  if (otpPepper === authSecret || otpPepper === jwtAccessSecret) {
    throw new Error("OTP_PEPPER must be different from other production secrets.");
  }
}

export function shouldUseDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim()) && !useMemoryStore();
}

function assertStrongSecret(name: string, value: string | undefined): void {
  if (!value) {
    throw new Error(`${name} is required in production.`);
  }

  if (value.length < 32) {
    throw new Error(`${name} must be at least 32 characters in production.`);
  }

  const weakValues = new Set([
    "secret",
    "changeme",
    "development",
    "uyanik123",
    "local-ci-build-secret-not-for-production-32chars",
  ]);
  if (weakValues.has(value.toLowerCase())) {
    throw new Error(`${name} is too weak for production.`);
  }
}
