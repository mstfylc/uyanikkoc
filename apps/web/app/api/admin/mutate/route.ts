// Admin mutasyonu — lisans/plan/modül/görev/koç işlemleri. Güncel snapshot döner.
// apps/web/app/api/admin/mutate/route.ts

import { NextResponse } from "next/server";

import { snapshotContextFromSession } from "@/lib/admin/snapshot-context";
import { withApiAuth } from "@/lib/auth/api-guard";
import { AdminMutationError, applyAdminMutation } from "@/server/services/admin.service";
import type { AdminMutation } from "@/lib/admin/types";

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
  "addBranch",
  "updateBranch",
  "sendPaymentReminder",
  "updateOrgBilling",
  "updateOrgNotifications",
  "requestDataExport",
  "cancelOrgSubscription",
  "inviteOrgCoach",
  "inviteStudent",
  "resetDemo",
  // Öğrenci paketleri: kurum kendi org'una (ince scope mutation-scope.ts'te zorlanır).
  "addStudentPackage",
  "updateStudentPackage",
  "deleteStudentPackage",
];

const COACH_ALLOWED: AdminMutation["kind"][] = [
  "completeTask",
  "buyCoachPlan",
  "setCoachAutoRenew",
  "renewCoachPlan",
  "cancelCoach",
  // Öğrenci paketleri: koç kendi sahipliğine (ince scope mutation-scope.ts'te zorlanır).
  "addStudentPackage",
  "updateStudentPackage",
  "deleteStudentPackage",
];

export const POST = withApiAuth(["admin", "branch", "coach"], async (req, { session }) => {
  const body = (await req.json()) as AdminMutation;
  if (!body || typeof body.kind !== "string") {
    return NextResponse.json({ error: "mutation kind is required" }, { status: 400 });
  }

  const role = session.user.role;

  if (role === "branch" && !BRANCH_ALLOWED.includes(body.kind)) {
    return NextResponse.json({ error: "forbidden mutation for branch role" }, { status: 403 });
  }

  if (role === "coach" && !COACH_ALLOWED.includes(body.kind)) {
    return NextResponse.json({ error: "forbidden mutation for coach role" }, { status: 403 });
  }

  try {
    const snapshot = await applyAdminMutation(
      body,
      snapshotContextFromSession(session.user),
      role,
    );
    return NextResponse.json(snapshot, { status: 200 });
  } catch (error) {
    if (error instanceof AdminMutationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
});
