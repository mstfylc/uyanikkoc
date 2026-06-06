import type { AppRole } from "@uyanik/tokens";
import type { NotificationRecord } from "@uyanik/database";

export type NotificationTone = "primary" | "info" | "warning" | "danger" | "success";

export type NotificationDisplayMeta = {
  icon: string;
  tone: NotificationTone;
  href: string;
};

export type NotificationChannelKey = "app" | "email" | "sms";

export type NotificationCategory = {
  key: string;
  icon: string;
  tone: NotificationTone;
  title: string;
  desc: string;
};

export type NotificationPrefs = {
  types: Record<string, Record<NotificationChannelKey, boolean>>;
  quiet: { enabled: boolean; from: string; to: string };
};

export const NOTIF_CHANNELS: Array<{ key: NotificationChannelKey; label: string; icon: string }> = [
  { key: "app", label: "Uygulama", icon: "ki-notification-on" },
  { key: "email", label: "E-posta", icon: "ki-message-text" },
  { key: "sms", label: "SMS", icon: "ki-send" },
];

export const NOTIF_CATS: Record<"student" | "coach" | "parent", NotificationCategory[]> = {
  student: [
    { key: "odev", icon: "ki-notepad-edit", tone: "primary", title: "Odev hatirlatmalari", desc: "Yeni odev, yaklasan ve geciken teslimler" },
    { key: "deneme", icon: "ki-chart-simple", tone: "info", title: "Deneme sonuclari", desc: "Sonuc yayinlandiginda ve analiz hazir oldugunda" },
    { key: "randevu", icon: "ki-calendar", tone: "warning", title: "Randevu hatirlatmalari", desc: "Koc gorusmelerinden once hatirlatma" },
    { key: "mesaj", icon: "ki-message-text", tone: "info", title: "Mesajlar", desc: "Kocundan gelen yeni mesajlar" },
    { key: "motivasyon", icon: "ki-flame", tone: "danger", title: "Motivasyon & seri", desc: "Calisma serisi, rozetler ve gunluk hatirlatma" },
  ],
  coach: [
    { key: "odev", icon: "ki-notepad-edit", tone: "primary", title: "Odev & gorev", desc: "Ogrenci odevi tamamladiginda veya geciktiğinde" },
    { key: "risk", icon: "ki-information-2", tone: "danger", title: "Risk uyarilari", desc: "Ogrenci aktivitesi dustugunde erken uyari" },
    { key: "deneme", icon: "ki-chart-simple", tone: "info", title: "Deneme sonuclari", desc: "Ice aktarilan denemeler ve sinif ortalamasi" },
    { key: "randevu", icon: "ki-calendar", tone: "warning", title: "Randevu talepleri", desc: "Yeni randevu istekleri ve hatirlatmalar" },
    { key: "mesaj", icon: "ki-message-text", tone: "info", title: "Mesajlar", desc: "Ogrenci ve velilerden gelen mesajlar" },
    { key: "tahsilat", icon: "ki-dollar", tone: "success", title: "Tahsilat & gelir", desc: "Odeme alindiginda ve geciken tahsilatlarda" },
  ],
  parent: [
    { key: "deneme", icon: "ki-chart-simple", tone: "info", title: "Deneme sonuclari", desc: "Cocugunuzun deneme sonuclari yayinlandiginda" },
    { key: "ozet", icon: "ki-chart-line-up", tone: "success", title: "Haftalik rapor", desc: "Gelisim ozeti ve tamamlama oranlari" },
    { key: "randevu", icon: "ki-calendar", tone: "warning", title: "Veli gorusmeleri", desc: "Kocla planlanan gorusme hatirlatmalari" },
    { key: "mesaj", icon: "ki-message-text", tone: "info", title: "Mesajlar", desc: "Koçtan gelen mesaj ve duyurular" },
    { key: "odeme", icon: "ki-wallet", tone: "primary", title: "Odeme & abonelik", desc: "Yenileme, fatura ve odeme hatirlatmalari" },
  ],
};

const ROLE_ROUTES: Record<"student" | "coach" | "parent", Record<string, string>> = {
  student: {
    assignments: "/student/assignments",
    exams: "/student/exams",
    appointments: "/student/appointments",
    motivation: "/student/motivation",
    dashboard: "/student",
    messages: "/student/messages",
    billing: "/student/billing",
  },
  coach: {
    students: "/coach/students",
    "c-assignments": "/coach/assignments",
    "c-exams": "/coach/exams",
    appointments: "/coach/appointments",
    revenue: "/coach/revenue",
    messages: "/coach/messages",
  },
  parent: {
    "p-exams": "/parent/exams",
    dashboard: "/parent",
    appointments: "/parent/appointments",
    billing: "/parent/billing",
    messages: "/parent/messages",
  },
};

const META_BY_ID: Record<string, Omit<NotificationDisplayMeta, "href"> & { page?: string }> = {
  notif_s1: { icon: "ki-notepad-edit", tone: "primary", page: "assignments" },
  notif_s2: { icon: "ki-chart-simple", tone: "info", page: "exams" },
  notif_s3: { icon: "ki-calendar", tone: "warning", page: "appointments" },
  notif_s4: { icon: "ki-flame", tone: "danger", page: "motivation" },
  notif_s5: { icon: "ki-message-text", tone: "info", page: "dashboard" },
  notif_c1: { icon: "ki-information-2", tone: "danger", page: "students" },
  notif_c2: { icon: "ki-check-circle", tone: "success", page: "c-assignments" },
  notif_c3: { icon: "ki-chart-simple", tone: "info", page: "c-exams" },
  notif_c4: { icon: "ki-calendar", tone: "warning", page: "appointments" },
  notif_c5: { icon: "ki-dollar", tone: "success", page: "revenue" },
  notif_p1: { icon: "ki-chart-simple", tone: "info", page: "p-exams" },
  notif_p2: { icon: "ki-chart-line-up", tone: "success", page: "dashboard" },
  notif_p3: { icon: "ki-calendar", tone: "warning", page: "appointments" },
  notif_p4: { icon: "ki-wallet", tone: "primary", page: "billing" },
};

function inferMeta(notification: NotificationRecord): Omit<NotificationDisplayMeta, "href"> {
  const title = notification.title.toLocaleLowerCase("tr-TR");
  if (title.includes("odev") || title.includes("gorev")) {
    return { icon: "ki-notepad-edit", tone: "primary" };
  }
  if (title.includes("deneme") || title.includes("sonuc")) {
    return { icon: "ki-chart-simple", tone: "info" };
  }
  if (title.includes("randevu") || title.includes("gorusme")) {
    return { icon: "ki-calendar", tone: "warning" };
  }
  if (title.includes("mesaj")) {
    return { icon: "ki-message-text", tone: "info" };
  }
  if (title.includes("tahsilat") || title.includes("odeme") || title.includes("abonelik")) {
    return { icon: "ki-wallet", tone: "primary" };
  }
  if (title.includes("risk")) {
    return { icon: "ki-information-2", tone: "danger" };
  }
  return { icon: "ki-notification-on", tone: "info" };
}

export function getNotificationMeta(
  role: "student" | "coach" | "parent",
  notification: NotificationRecord,
): NotificationDisplayMeta {
  const mapped = META_BY_ID[notification.id];
  const base = mapped ?? inferMeta(notification);
  const page = mapped?.page;
  const href = page ? (ROLE_ROUTES[role][page] ?? `/${role}`) : `/${role}/notifications`;
  return { icon: base.icon, tone: base.tone, href };
}

export function relTime(iso: string, now = Date.now()): string {
  const diffMs = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) {
    return "az once";
  }
  if (min < 60) {
    return `${min} dk once`;
  }
  const hours = Math.floor(min / 60);
  if (hours < 24) {
    return `${hours} saat once`;
  }
  const days = Math.floor(hours / 24);
  return `${days} gun once`;
}

export function isToday(iso: string, now = Date.now()): boolean {
  const date = new Date(iso);
  const today = new Date(now);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function settingsPath(role: AppRole): string {
  return `/${role}/settings?tab=bildirimler`;
}

const NPREF_KEY = "uk_notif_prefs_v1";

function defaultPrefs(role: "student" | "coach" | "parent"): NotificationPrefs {
  const types: NotificationPrefs["types"] = {};
  for (const cat of NOTIF_CATS[role]) {
    types[cat.key] = {
      app: true,
      email: cat.key !== "motivasyon",
      sms: cat.key === "randevu" || cat.key === "risk",
    };
  }
  return { types, quiet: { enabled: true, from: "22:00", to: "07:00" } };
}

export function loadNotificationPrefs(role: "student" | "coach" | "parent"): NotificationPrefs {
  if (typeof window === "undefined") {
    return defaultPrefs(role);
  }
  try {
    const all = JSON.parse(localStorage.getItem(NPREF_KEY) ?? "{}") as Record<string, NotificationPrefs>;
    if (all[role]) {
      return all[role];
    }
  } catch {
    /* ignore */
  }
  return defaultPrefs(role);
}

export function saveNotificationPrefs(role: "student" | "coach" | "parent", prefs: NotificationPrefs): void {
  if (typeof window === "undefined") {
    return;
  }
  let all: Record<string, NotificationPrefs> = {};
  try {
    all = JSON.parse(localStorage.getItem(NPREF_KEY) ?? "{}") as Record<string, NotificationPrefs>;
  } catch {
    /* ignore */
  }
  all[role] = prefs;
  localStorage.setItem(NPREF_KEY, JSON.stringify(all));
}

export function countActiveChannels(role: "student" | "coach" | "parent", prefs: NotificationPrefs): number {
  return NOTIF_CATS[role].reduce(
    (total, cat) =>
      total + NOTIF_CHANNELS.filter((channel) => prefs.types[cat.key]?.[channel.key]).length,
    0,
  );
}
