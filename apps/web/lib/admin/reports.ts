// Kurum rapor oluşturucu — sabitler ve veri türetimi. apps/web/lib/admin/reports.ts
// Prototip kaynağı: admin/kurum2.jsx (KurumReports).

import { orgCoaches, orgStudents, type OrgCoach, type OrgStudent } from "@/lib/admin/derive";
import type { Org } from "@/lib/admin/types";

export const REPORT_SECTIONS = [
  { key: "ozet", label: "Genel özet", icon: "dashboard", desc: "Öğrenci, koç, ortalama net ve devam" },
  { key: "net", label: "Net dağılımı", icon: "chart", desc: "Başarı bantlarına göre öğrenci sayısı" },
  { key: "brans", label: "Branş analizi", icon: "book", desc: "Branş bazında ortalama net" },
  { key: "devam", label: "Devam oranı", icon: "calendar", desc: "Ortalama derse katılım" },
  { key: "gelir", label: "Gelir özeti", icon: "banknote", desc: "Tahsilat, platform ücreti ve net" },
  { key: "koc", label: "Koç performansı", icon: "users", desc: "Koç başına öğrenci ve puan" },
  { key: "risk", label: "Risk listesi", icon: "alert", desc: "Düşüşte / risk altındaki öğrenciler" },
] as const;

export type ReportSectionKey = (typeof REPORT_SECTIONS)[number]["key"];

export const REPORT_PERIODS = [
  ["30", "Son 30 gün"],
  ["donem", "Bu dönem"],
  ["90", "Son 3 ay"],
  ["all", "Tüm zamanlar"],
] as const;

export type ReportPeriodKey = (typeof REPORT_PERIODS)[number][0];

export type ReportSelection = Record<ReportSectionKey, boolean>;

export type ReportContext = {
  org: Org;
  branchName: string | null;
  periodLabel: string;
  students: OrgStudent[];
  coaches: OrgCoach[];
  avgNet: number;
  avgAttend: number;
  risk: OrgStudent[];
  dist: { l: string; v: number; color: string }[];
  subjects: { l: string; v: number }[];
  collect: number;
  fee: number;
};

const SUBJECTS = [
  { l: "Türkçe", v: 32 },
  { l: "Matematik", v: 28 },
  { l: "Fen", v: 17 },
  { l: "Sosyal", v: 15 },
];

function periodFactor(period: ReportPeriodKey): number {
  switch (period) {
    case "30":
      return 0.35;
    case "90":
      return 0.72;
    case "all":
      return 1;
    default:
      return 0.55;
  }
}

export function buildReportContext(
  org: Org,
  scope: string,
  period: ReportPeriodKey,
): ReportContext {
  const allStudents = orgStudents(org);
  const allCoaches = orgCoaches(org);
  const branchName = scope === "all" ? null : (org.branches.find((b) => b.id === scope)?.name ?? null);
  const students =
    scope === "all" ? allStudents : allStudents.filter((s) => s.branch === branchName);
  const coaches = scope === "all" ? allCoaches : allCoaches.filter((c) => c.branchId === scope);
  const periodLabel = REPORT_PERIODS.find((p) => p[0] === period)?.[1] ?? "Bu dönem";
  const factor = periodFactor(period);
  const scopedStudents = students.slice(0, Math.max(1, Math.round(students.length * factor)));

  const avgNet = scopedStudents.length
    ? Math.round(scopedStudents.reduce((s, x) => s + x.net, 0) / scopedStudents.length)
    : 0;
  const avgAttend = scopedStudents.length
    ? Math.round(scopedStudents.reduce((s, x) => s + x.attend, 0) / scopedStudents.length)
    : 0;
  const risk = scopedStudents.filter((s) => s.status === "risk");
  const dist = [
    { l: "150+ net", v: scopedStudents.filter((s) => s.net >= 150).length, color: "var(--success)" },
    { l: "100-149", v: scopedStudents.filter((s) => s.net >= 100 && s.net < 150).length, color: "var(--primary)" },
    { l: "60-99", v: scopedStudents.filter((s) => s.net >= 60 && s.net < 100).length, color: "var(--warning)" },
    { l: "60 altı", v: scopedStudents.filter((s) => s.net < 60).length, color: "var(--danger)" },
  ];
  const branchRows = scope === "all" ? org.branches : org.branches.filter((b) => b.id === scope);
  const totalCollectAll = org.branches.reduce((s, b) => s + b.collect, 0) || 1;
  const collect = branchRows.reduce((s, b) => s + b.collect, 0);
  const fee =
    scope === "all" ? org.feeMonthly : Math.round(org.feeMonthly * (collect / totalCollectAll));

  return {
    org,
    branchName,
    periodLabel,
    students: scopedStudents,
    coaches,
    avgNet,
    avgAttend,
    risk,
    dist,
    subjects: SUBJECTS.map((s) => ({ ...s, v: Math.round(s.v * factor) })),
    collect,
    fee,
  };
}

export function buildReportLines(ctx: ReportContext, sel: ReportSelection): string[] {
  const L: string[] = [];
  L.push(ctx.org.name + " — KURUM RAPORU");
  L.push(
    (ctx.branchName ? "Şube: " + ctx.branchName : "Kapsam: Tüm kurum") + " · Dönem: " + ctx.periodLabel,
  );
  L.push("Oluşturma: " + new Date().toLocaleDateString("tr-TR"));
  L.push("");
  if (sel.ozet) {
    L.push("— GENEL ÖZET —", "Öğrenci: " + ctx.students.length, "Koç: " + ctx.coaches.length, "Ortalama net: " + ctx.avgNet, "Devam oranı: %" + ctx.avgAttend, "");
  }
  if (sel.net) {
    L.push("— NET DAĞILIMI —", ...ctx.dist.map((d) => d.l + ": " + d.v), "");
  }
  if (sel.brans) {
    L.push("— BRANŞ ANALİZİ (ort. net) —", ...ctx.subjects.map((s) => s.l + ": " + s.v), "");
  }
  if (sel.devam) {
    L.push("— DEVAM ORANI —", "Ortalama: %" + ctx.avgAttend, "");
  }
  if (sel.gelir) {
    L.push("— GELİR ÖZETİ —", "Tahsilat: " + ctx.collect + " TL", "Platform ücreti: " + ctx.fee + " TL", "Net: " + (ctx.collect - ctx.fee) + " TL", "");
  }
  if (sel.koc) {
    L.push("— KOÇ PERFORMANSI —", ...ctx.coaches.slice(0, 20).map((c) => c.name + ": " + c.students + " öğrenci, puan " + c.rating), "");
  }
  if (sel.risk) {
    L.push("— RİSK LİSTESİ (" + ctx.risk.length + ") —", ...ctx.risk.slice(0, 30).map((s) => s.name + " (" + s.branch + ", net " + s.net + ")"), "");
  }
  return L;
}

export function buildReportCsvRows(ctx: ReportContext, sel: ReportSelection): (string | number)[][] {
  const rows: (string | number)[][] = [["Bölüm", "Metrik", "Değer"]];
  if (sel.ozet) {
    rows.push(["Özet", "Öğrenci", ctx.students.length], ["Özet", "Koç", ctx.coaches.length], ["Özet", "Ortalama net", ctx.avgNet], ["Özet", "Devam %", ctx.avgAttend]);
  }
  if (sel.net) ctx.dist.forEach((d) => rows.push(["Net dağılımı", d.l, d.v]));
  if (sel.brans) ctx.subjects.forEach((s) => rows.push(["Branş", s.l, s.v]));
  if (sel.gelir) {
    rows.push(["Gelir", "Tahsilat", ctx.collect], ["Gelir", "Platform ücreti", ctx.fee], ["Gelir", "Net", ctx.collect - ctx.fee]);
  }
  if (sel.koc) ctx.coaches.forEach((c) => rows.push(["Koç", c.name, c.students + " öğrenci / puan " + c.rating]));
  if (sel.risk) ctx.risk.forEach((s) => rows.push(["Risk", s.name, s.branch + " / net " + s.net]));
  return rows;
}
