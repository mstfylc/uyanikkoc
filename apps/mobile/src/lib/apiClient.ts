/* API istemcisi — Bearer access token + 401'de tek seferlik refresh rotasyonu.
 * USE_MOCK iken iç-süreç mock backend'e (src/mocks/mockApi) yönlendirir. */
import { API_BASE, USE_MOCK } from "./config";
import { ApiError } from "./api-error";
import { tokenStore } from "./tokens";
import { mockApi } from "../mocks/mockApi";
import type { TokenPair } from "./api-types";

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Bearer access token ekle (varsayılan true). */
  auth?: boolean;
}

async function realFetch<T>(path: string, opts: ApiOptions, accessToken: string | null): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth !== false && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(API_BASE + path, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    throw new ApiError(res.status, typeof rec.message === "string" ? rec.message : res.statusText, typeof rec.code === "string" ? rec.code : undefined);
  }
  return data as T;
}

let refreshing: Promise<TokenPair> | null = null;

async function doRefresh(): Promise<TokenPair> {
  const { refresh } = await tokenStore.get();
  if (!refresh) throw new ApiError(401, "Oturum yok", "no_session");
  const tokens = await realFetch<TokenPair>("/api/auth/refresh", { method: "POST", body: { refreshToken: refresh }, auth: false }, null);
  await tokenStore.set(tokens);
  return tokens;
}

function refreshOnce(): Promise<TokenPair> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  if (USE_MOCK) {
    return mockApi<T>(path, { method: opts.method ?? "GET", body: opts.body });
  }

  const { access } = await tokenStore.get();
  try {
    return await realFetch<T>(path, opts, access);
  } catch (err) {
    // token_expired → tek seferlik refresh, sonra orijinal isteği tekrar dene
    if (err instanceof ApiError && err.status === 401 && opts.auth !== false) {
      try {
        const tokens = await refreshOnce();
        return await realFetch<T>(path, opts, tokens.accessToken);
      } catch (refreshErr) {
        await tokenStore.clear();
        throw refreshErr;
      }
    }
    throw err;
  }
}
