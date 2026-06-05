/**
 * Vercel'de sabit AUTH_URL (örn. farklı *.vercel.app alias veya uyanikkoc.com)
 * trustHost ile birlikte kullanıldığında Auth.js `Configuration` hatasına yol açar.
 * Demo deploy'da istek host'undan URL türetilir.
 */
export function sanitizeAuthEnvForVercel(): void {
  if (process.env.VERCEL !== "1") {
    return;
  }

  delete process.env.AUTH_URL;
  delete process.env.NEXTAUTH_URL;
}

export function getAuthEnvDiagnostics(): {
  vercel: boolean;
  authSecret: "ok" | "missing";
  authUrlSet: boolean;
  nextAuthUrlSet: boolean;
} {
  return {
    vercel: process.env.VERCEL === "1",
    authSecret: (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET)?.trim() ? "ok" : "missing",
    authUrlSet: Boolean(process.env.AUTH_URL?.trim()),
    nextAuthUrlSet: Boolean(process.env.NEXTAUTH_URL?.trim()),
  };
}
