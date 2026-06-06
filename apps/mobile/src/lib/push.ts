/* Push cihaz token kaydı (handoff M3) — backend ucu hazır (/api/devices).
 *
 * Native push (@capacitor/push-notifications) build aşamasında eklenecek; o katman
 * registration token'ı alıp aşağıdaki registerPushToken'ı çağırır. Bu dosya plugin'e
 * bağımlı DEĞİL — yalnızca token'ı backend'e iletir, böylece web build'i etkilenmez. */
import { api } from "./apiClient";
import type { DevicePlatform } from "./api-types";

/** Cihaz push token'ını backend'e kaydet/güncelle. */
export async function registerPushToken(token: string, platform: DevicePlatform): Promise<void> {
  await api("/api/devices", { method: "POST", body: { token, platform } });
}

/** Çıkışta cihaz token'ını sil. */
export async function unregisterPushToken(token: string): Promise<void> {
  await api("/api/devices", { method: "DELETE", body: { token } });
}
