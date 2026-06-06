// Plan + modül kataloğu ve saf yardımcılar. apps/web/lib/admin/pricing.ts
// Prototip kaynağı: admin/admin-data.jsx (MODULES, ORG_PLANS, COACH_PLANS, STATUS).

import type {
  CoachPlan,
  CoachPlanId,
  LicenseStatus,
  ModuleDef,
  ModuleFlags,
  ModuleKey,
  OrgPlan,
  OrgPlanId,
  StudentPlanId,
  StudentSubscription,
} from "./types";

/** Modül kataloğu (özellik bayrakları). */
export const MODULES: ModuleDef[] = [
  { key: "denemeAnaliz", name: "Deneme Analizi", icon: "chart", desc: "Net takibi, branş analizi, gelişim grafikleri" },
  { key: "raporlar", name: "Raporlar", icon: "trend", desc: "Veli ve kurum gelişim raporları" },
  { key: "mesajlasma", name: "Mesajlaşma", icon: "message", desc: "Koç · öğrenci · veli mesajlaşma" },
  { key: "randevu", name: "Randevu Sistemi", icon: "calendar", desc: "Birebir görüşme planlama" },
  { key: "veliPaneli", name: "Veli Paneli", icon: "heart", desc: "Veliler için gelişim takibi" },
  { key: "onlineDeneme", name: "Online Deneme", icon: "clipboard", desc: "Online sınav ve optik okuma" },
  { key: "aiKoc", name: "AI Koç", icon: "bolt", desc: "Yapay zekâ destekli çalışma önerileri", premium: true },
  { key: "envanter", name: "Envanter & Testler", icon: "star", desc: "Kişilik ve yönelim envanterleri", premium: true },
];

export function moduleName(key: ModuleKey): string {
  return MODULES.find((m) => m.key === key)?.name ?? key;
}

export function moduleDef(key: ModuleKey): ModuleDef {
  return MODULES.find((m) => m.key === key) ?? MODULES[0];
}

/** Kurum lisans planları (B2B). */
export const ORG_PLANS: OrgPlan[] = [
  {
    id: "baslangic",
    name: "Kurum Başlangıç",
    color: "var(--info)",
    monthly: 4900,
    seats: 50,
    coaches: 5,
    branches: 1,
    tagline: "Tek şubeli kurumlar için",
    modules: ["denemeAnaliz", "raporlar", "mesajlasma", "randevu"],
  },
  {
    id: "pro",
    name: "Kurum Pro",
    color: "var(--primary)",
    monthly: 11900,
    seats: 150,
    coaches: 12,
    branches: 1,
    tagline: "Büyüyen kurumlar için",
    popular: true,
    modules: ["denemeAnaliz", "raporlar", "mesajlasma", "randevu", "veliPaneli", "onlineDeneme"],
  },
  {
    id: "franchise",
    name: "Franchise",
    color: "var(--warning)",
    monthly: 24900,
    seats: 400,
    coaches: 40,
    branches: 8,
    tagline: "Çok şubeli franchise ağları",
    modules: [
      "denemeAnaliz",
      "raporlar",
      "mesajlasma",
      "randevu",
      "veliPaneli",
      "onlineDeneme",
      "aiKoc",
      "envanter",
    ],
  },
];

export function orgPlanById(id: OrgPlanId): OrgPlan {
  return ORG_PLANS.find((p) => p.id === id) ?? ORG_PLANS[0];
}

/** Bireysel koç lisans planları (B2C koç). */
export const COACH_PLANS: CoachPlan[] = [
  {
    id: "c-baslangic",
    name: "Başlangıç",
    color: "var(--info)",
    monthly: 499,
    annual: 4990,
    seats: 15,
    tagline: "Koçluğa yeni başlayanlar",
    features: ["15 öğrenciye kadar", "Deneme analizi", "Ödev & konu takibi", "Koç–öğrenci mesajlaşma"],
    modules: ["denemeAnaliz", "mesajlasma"],
  },
  {
    id: "c-pro",
    name: "Pro",
    color: "var(--primary)",
    monthly: 999,
    annual: 9990,
    seats: 40,
    tagline: "Aktif çalışan koçlar için",
    popular: true,
    features: ["40 öğrenciye kadar", "Başlangıç'taki her şey", "Veli paneli & raporlar", "Randevu sistemi", "Online deneme"],
    modules: ["denemeAnaliz", "mesajlasma", "raporlar", "veliPaneli", "randevu", "onlineDeneme"],
  },
  {
    id: "c-sinirsiz",
    name: "Sınırsız",
    color: "var(--warning)",
    monthly: 1799,
    annual: 17990,
    seats: 999,
    tagline: "Profesyonel koçlar & küçük kadrolar",
    features: ["Sınırsız öğrenci", "Pro'daki her şey", "AI Koç önerileri", "Envanter & testler", "Öncelikli destek"],
    modules: ["denemeAnaliz", "mesajlasma", "raporlar", "veliPaneli", "randevu", "onlineDeneme", "aiKoc", "envanter"],
  },
];

export function coachPlanById(id: CoachPlanId): CoachPlan {
  return COACH_PLANS.find((p) => p.id === id) ?? COACH_PLANS[0];
}

/** Öğrenci abonelik planları (şube tahsilat tablosu). */
export type StudentPlan = {
  id: StudentPlanId;
  name: string;
  color: string;
  monthly: number;
  annual: number;
};

export const STUDENT_PLANS: StudentPlan[] = [
  { id: "standart", name: "Standart", color: "var(--info)", monthly: 1499, annual: 14990 },
  { id: "plus", name: "Plus", color: "var(--primary)", monthly: 2299, annual: 22990 },
  { id: "vip", name: "VIP", color: "var(--warning)", monthly: 3499, annual: 34990 },
];

export function studentPlanById(id: StudentPlanId): StudentPlan {
  return STUDENT_PLANS.find((p) => p.id === id) ?? STUDENT_PLANS[0];
}

export function subscriptionMrr(sub: Pick<StudentSubscription, "planId" | "cycle">): number {
  const p = studentPlanById(sub.planId);
  return sub.cycle === "annual" ? Math.round(p.annual / 12) : p.monthly;
}

/** Modülleri plana göre kur. */
export function modulesFromPlan(planModules: ModuleKey[]): ModuleFlags {
  const out = {} as ModuleFlags;
  MODULES.forEach((m) => {
    out[m.key] = planModules.includes(m.key);
  });
  return out;
}

export type StatusTone = "success" | "info" | "warning" | "danger" | "muted";

const STATUS_META: Record<LicenseStatus, { label: string; tone: StatusTone }> = {
  active: { label: "Aktif", tone: "success" },
  trial: { label: "Deneme", tone: "info" },
  expiring: { label: "Süresi doluyor", tone: "warning" },
  overdue: { label: "Ödeme gecikti", tone: "danger" },
  suspended: { label: "Donduruldu", tone: "muted" },
  canceled: { label: "İptal edildi", tone: "danger" },
};

export function statusMeta(status: LicenseStatus): { label: string; tone: StatusTone } {
  return STATUS_META[status] ?? STATUS_META.active;
}
