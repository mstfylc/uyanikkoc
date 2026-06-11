import type { AppRole } from "@uyanik/tokens";

import { DEMO_COACH_ID, DEMO_ORG_ID } from "@/lib/auth/demo-users";
import { orgCoaches } from "@/lib/admin/derive";
import type { Org, SoloCoach } from "@/lib/admin/types";

export type AdminSnapshotContext = {
  userId?: string | null;
  organizationId?: string | null;
  coachId?: string | null;
  role?: AppRole;
};

export function snapshotContextFromSession(user: {
  id?: string | null;
  role: AppRole;
  organizationId?: string | null;
  coachId?: string | null;
}): AdminSnapshotContext {
  return {
    userId: user.id,
    organizationId: user.organizationId,
    coachId: user.coachId,
    role: user.role,
  };
}

export function resolveActiveOrgId(orgs: Org[], ctx: AdminSnapshotContext = {}): string {
  if (ctx.organizationId && orgs.some((o) => o.id === ctx.organizationId)) {
    return ctx.organizationId;
  }
  if (orgs.some((o) => o.id === DEMO_ORG_ID)) {
    return DEMO_ORG_ID;
  }
  return orgs[0]?.id ?? "";
}

export function resolveOrgCoachId(
  org: Org,
  sessionCoachId: string | null | undefined,
  soloCoaches: SoloCoach[],
): string {
  const orgCoachList = orgCoaches(org);
  if (!sessionCoachId) {
    return orgCoachList[0]?.id ?? "";
  }

  const inOrg = orgCoachList.find((c) => c.id === sessionCoachId);
  if (inOrg) {
    return inOrg.id;
  }

  if (sessionCoachId === DEMO_COACH_ID && org.id === DEMO_ORG_ID) {
    return orgCoachList[0]?.id ?? sessionCoachId;
  }

  if (soloCoaches.some((c) => c.id === sessionCoachId)) {
    return sessionCoachId;
  }

  return orgCoachList[0]?.id ?? sessionCoachId;
}

/** Bireysel koç lisansı — oturum koçu solo listesinde yoksa demo eşlemesi. */
export function resolveSoloCoachId(
  sessionCoachId: string | null | undefined,
  soloCoaches: SoloCoach[],
): string | null {
  if (!sessionCoachId) return null;
  if (soloCoaches.some((c) => c.id === sessionCoachId)) {
    return sessionCoachId;
  }
  if (sessionCoachId === DEMO_COACH_ID) {
    return soloCoaches.find((c) => c.id === "selin-yilmaz")?.id ?? null;
  }
  return null;
}
