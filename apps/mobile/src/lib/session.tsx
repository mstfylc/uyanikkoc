/* Oturum context'i — açılışta /api/me ile bootstrap, OTP/e-posta giriş, çıkış. */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./apiClient";
import { tokenStore } from "./tokens";
import type { AuthResponse, MeResponse, OtpRequestResponse } from "./api-types";

type Status = "loading" | "anon" | "authed";

interface SessionValue {
  status: Status;
  me: MeResponse | null;
  requestOtp: (phone: string) => Promise<OtpRequestResponse>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  loginEmail: (email: string, password: string) => Promise<void>;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [me, setMe] = useState<MeResponse | null>(null);

  const loadMe = useCallback(async () => {
    const data = await api<MeResponse>("/api/me");
    setMe(data);
    setStatus("authed");
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { access, refresh } = await tokenStore.get();
      if (!access && !refresh) {
        if (active) setStatus("anon");
        return;
      }
      try {
        await loadMe();
      } catch {
        await tokenStore.clear();
        if (active) setStatus("anon");
      }
    })();
    return () => {
      active = false;
    };
  }, [loadMe]);

  const afterAuth = useCallback(
    async (res: AuthResponse) => {
      await tokenStore.set(res);
      await loadMe();
    },
    [loadMe],
  );

  const requestOtp = useCallback((phone: string) => api<OtpRequestResponse>("/api/auth/otp/request", { method: "POST", body: { phone }, auth: false }), []);

  const verifyOtp = useCallback(
    async (phone: string, code: string) => {
      const res = await api<AuthResponse>("/api/auth/otp/verify", { method: "POST", body: { phone, code }, auth: false });
      await afterAuth(res);
    },
    [afterAuth],
  );

  const loginEmail = useCallback(
    async (email: string, password: string) => {
      const res = await api<AuthResponse>("/api/auth/email", { method: "POST", body: { email, password }, auth: false });
      await afterAuth(res);
    },
    [afterAuth],
  );

  const logout = useCallback(async () => {
    await tokenStore.clear();
    setMe(null);
    setStatus("anon");
  }, []);

  const value: SessionValue = { status, me, requestOtp, verifyOtp, loginEmail, refreshMe: loadMe, logout };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession yalnızca SessionProvider içinde kullanılır");
  return ctx;
}
