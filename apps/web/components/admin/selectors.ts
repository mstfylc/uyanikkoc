// Snapshot türevli istemci seçicileri. apps/web/components/admin/selectors.ts
"use client";

import { orgCoaches, orgStudents, type OrgCoach, type OrgStudent } from "@/lib/admin/derive";
import { daysLeft } from "@/lib/admin/format";
import { coachPlanById, orgPlanById, statusMeta } from "@/lib/admin/pricing";
import type {
  AdminAccess,
  AdminSnapshot,
  CoachFeedback,
  CoachTask,
  LicenseStatus,
  Org,
} from "@/lib/admin/types";

export function getActiveOrg(snapshot: AdminSnapshot, activeOrgId: string): Org {
  return snapshot.orgs.find((o) => o.id === activeOrgId) ?? snapshot.orgs[0];
}

/** Kurumdan çıkarılan koçlar hariç koç listesi. */
export function visibleOrgCoaches(snapshot: AdminSnapshot, org: Org): OrgCoach[] {
  const removed = new Set(snapshot.removedCoachIds);
  return orgCoaches(org).filter((c) => !removed.has(c.id));
}

export function visibleOrgStudents(snapshot: AdminSnapshot, org: Org): OrgStudent[] {
  return orgStudents(org, {
    removedStudentIds: snapshot.removedStudentIds,
    passiveStudentIds: snapshot.passiveStudentIds,
  });
}

export function allOrgCoaches(org: Org): OrgCoach[] {
  return orgCoaches(org);
}

export function coachTasks(snapshot: AdminSnapshot, coachId: string): CoachTask[] {
  return snapshot.tasks
    .filter((t) => t.coachId === coachId)
    .sort((a, b) => Number(a.status === "done") - Number(b.status === "done") || a.due - b.due);
}

export function coachFeedback(snapshot: AdminSnapshot, coachId: string): CoachFeedback[] {
  return snapshot.feedback
    .filter((f) => f.coachId === coachId)
    .sort((a, b) => b.date - a.date);
}

/** Süper admin: tam yetki mi? (support → salt görüntüleme, Destek hariç) */
export function canEdit(access: AdminAccess): boolean {
  return access === "full";
}

export type LicenseRow = {
  kind: "org" | "coach";
  id: string;
  name: string;
  sub: string;
  tone?: string;
  plan: string;
  status: LicenseStatus;
  renewsAt: number;
  fee: number;
  seats: { used: number; total: number };
  gifted: boolean;
};

export function licenseRows(snapshot: AdminSnapshot): LicenseRow[] {
  const orgRows: LicenseRow[] = snapshot.orgs.map((o) => ({
    kind: "org",
    id: o.id,
    name: o.name,
    sub: o.type === "franchise" ? "Franchise" : "Tek kurum",
    tone: o.tone,
    plan: orgPlanById(o.planId).name,
    status: o.status,
    renewsAt: o.renewsAt,
    fee: o.feeMonthly,
    seats: o.seats,
    gifted: !!o.giftedDemoUntil,
  }));
  const coachRows: LicenseRow[] = snapshot.coaches.map((c) => ({
    kind: "coach",
    id: c.id,
    name: c.name,
    sub: "Bireysel koç",
    plan: coachPlanById(c.planId).name,
    status: c.status,
    renewsAt: c.renewsAt,
    fee: c.feeMonthly,
    seats: c.seats,
    gifted: !!c.giftedDemoUntil,
  }));
  return [...orgRows, ...coachRows];
}

export function isExpiringSoon(row: { status: LicenseStatus; renewsAt: number }): boolean {
  return (
    row.status === "expiring" ||
    (daysLeft(row.renewsAt) >= 0 && daysLeft(row.renewsAt) <= 14 && row.status !== "overdue")
  );
}

export { statusMeta };
