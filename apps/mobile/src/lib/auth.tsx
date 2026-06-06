import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { apiFetch } from "./api";

const TOKEN_KEY = "uyanik_mobile_token";

export type MobileUser = {
  id: string;
  email: string;
  role: "student";
  studentId: string | null;
};

type AuthState = {
  token: string | null;
  user: MobileUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<MobileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!stored) {
      setToken(null);
      setUser(null);
      return;
    }

    try {
      const payload = await apiFetch<{ user: MobileUser }>("/api/mobile/auth/me", {
        token: stored,
      });
      setToken(stored);
      setUser(payload.user as MobileUser);
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await refresh();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const payload = await apiFetch<{ token: string; user: MobileUser }>("/api/mobile/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await SecureStore.setItemAsync(TOKEN_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, isLoading, login, logout, refresh }),
    [token, user, isLoading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
