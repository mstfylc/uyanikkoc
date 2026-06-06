/* Token saklama — Capacitor Preferences (native'de güvenli, web'de localStorage). */
import { Preferences } from "@capacitor/preferences";
import type { TokenPair } from "./api-types";

const ACCESS_KEY = "uk.access";
const REFRESH_KEY = "uk.refresh";

export const tokenStore = {
  async get(): Promise<{ access: string | null; refresh: string | null }> {
    const [access, refresh] = await Promise.all([
      Preferences.get({ key: ACCESS_KEY }),
      Preferences.get({ key: REFRESH_KEY }),
    ]);
    return { access: access.value, refresh: refresh.value };
  },

  async set({ accessToken, refreshToken }: TokenPair): Promise<void> {
    await Promise.all([
      Preferences.set({ key: ACCESS_KEY, value: accessToken }),
      Preferences.set({ key: REFRESH_KEY, value: refreshToken }),
    ]);
  },

  async clear(): Promise<void> {
    await Promise.all([Preferences.remove({ key: ACCESS_KEY }), Preferences.remove({ key: REFRESH_KEY })]);
  },
};
