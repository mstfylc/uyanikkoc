// Admin mutasyonu — lisans/plan/modül/görev/koç işlemleri. Güncel snapshot döner.
// apps/web/app/api/admin/mutate/route.ts

import { NextResponse } from "next/server";

import { snapshotContextFromSession } from "@/lib/admin/snapshot-context";
import { withApiAuth } from "@/lib/auth/api-guard";
import { applyAdminMutation } from "@/server/services/admin.service";
import type { AdminMutation } from "@/lib/admin/types";

// Süper admin: tüm mutasyonlar. Kurum (branch): yalnızca kendi kapsamı.
const BRANCH_ALLOWED: AdminMutation["kind"][] = [
  "renewOrg",
  "renewOrgPlan",
  "changeOrgPlan",
  "addOrgSeats",
  "updateOrgProfile",
  "assignTask",
  "completeTask",
  "deleteTask",
  "removeOrgCoach",
  "restoreOrgCoach",
  "inviteOrgManager",
  "removeOrgManager",
  "setOrgManagerRole",
  "setActiveOrg",
];

export const POST = withApiAuth(["admin", "branch"], async (req, { session }) => {
  const body = (await req.json()) as AdminMutation;
  if (!body || typeof body.kind !== "string") {
    return NextResponse.json({ error: "mutation kind is required" }, { status: 400 });
  }

  // Rol kapsamı: branch yalnızca izinli mutasyonları yapabilir.
  if (session.user.role === "branch" && !BRANCH_ALLOWED.includes(body.kind)) {
    return NextResponse.json({ error: "forbidden mutation for branch role" }, { status: 403 });
  }

  const snapshot = await applyAdminMutation(body, snapshotContextFromSession(session.user));
  return NextResponse.json(snapshot, { status: 200 });
});
