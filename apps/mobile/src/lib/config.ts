/* Çalışma zamanı yapılandırması (Vite env). */

/** Backend API kökü. Boşsa same-origin. Örn: http://localhost:3010 */
export const API_BASE: string = import.meta.env.VITE_API_BASE ?? "";

/**
 * Mock modu. Varsayılan AÇIK → uygulama backend olmadan tek başına çalışır
 * (vite dev). Gerçek sunucuya bağlanmak için `VITE_USE_MOCK=false` + `VITE_API_BASE`.
 */
export const USE_MOCK: boolean = (import.meta.env.VITE_USE_MOCK ?? "true") !== "false";
