import type { AppRole } from "@uyanik/tokens";

import { orgCoaches } from "@/lib/admin/derive";
import { resolveOrgCoachId, resolveSoloCoachId, type AdminSnapshotContext } from "@/lib/admin/snapshot-context";
import type { AdminMutation } from "@/lib/admin/types";
import * as memory from "@/mocks/admin";

export function mutationOrgId(m: AdminMutation): string | null {
  switch (m.kind) {
    case "renewOrg":
    case "renewOrgPlan":
    case "suspendOrg":
    case "activateOrg":
    case "changeOrgPlan":
    case "addOrgSeats":
    case "toggleOrgModule":
    case "updateOrgProfile":
    case "setActiveOrg":
    case "assignTask":
    case "inviteOrgManager":
    case "removeOrgManager":
    case "setOrgManagerRole":
    case "addBranch":
    case "updateBranch":
    case "updateOrgBilling":
    case "updateOrgNotifications":
    case "requestDataExport":
    case "cancelOrgSubscription":
    case "inviteOrgCoach":
    case "inviteStudent":
      return m.orgId;
    default:
      return null;
  }
}

export function assertMutationAllowed(
  m: AdminMutation,
  ctx: AdminSnapshotContext,
  role: AppRole,
): string | null {
  if (role === "admin") {
    return null;
  }

  if (role === "coach") {
    if (m.kind === "completeTask") {
      const task = memory.findTask(m.taskId);
      if (!task) {
        return "task not found";
      }
      const snapshot = memory.getMockSnapshot(ctx);
      const org = snapshot.orgs.find((o) => o.id === snapshot.activeOrgId);
      if (!org) {
        return "organization not found";
      }
      const coachId = resolveOrgCoachId(org, ctx.coachId, snapshot.coaches);
      if (task.coachId !== coachId) {
        return "forbidden task for coach";
      }
      return null;
    }
    if (m.kind === "buyCoachPlan" || m.kind === "setCoachAutoRenew" || m.kind === "renewCoachPlan" || m.kind === "cancelCoach") {
      const snapshot = memory.getMockSnapshot(ctx);
      const soloId = resolveSoloCoachId(ctx.coachId, snapshot.coaches);
      const targetId = m.coachId;
      if (!soloId || targetId !== soloId) {
        return "forbidden coach scope";
      }
      return null;
    }
    if (m.kind === "addStudentPackage" || m.kind === "updateStudentPackage" || m.kind === "deleteStudentPackage") {
      const snapshot = memory.getMockSnapshot(ctx);
      const soloId = resolveSoloCoachId(ctx.coachId, snapshot.coaches);
      if (!soloId) {
        return "forbidden coach scope";
      }
      if (m.kind === "addStudentPackage") {
        if (m.ownerKind !== "coach" || m.ownerId !== soloId) {
          return "forbidden package scope";
        }
      } else {
        const pkg = snapshot.studentPackages.find((p) => p.id === m.packageId);
        if (!pkg || pkg.ownerKind !== "coach" || pkg.ownerId !== soloId) {
          return "forbidden package scope";
        }
      }
      return null;
    }
    return "forbidden mutation for coach role";
  }

  if (role !== "branch") {
    return "forbidden role";
  }

  const orgId = ctx.organizationId;
  if (!orgId) {
    return "organization context required";
  }

  const scopedOrgId = mutationOrgId(m);
  if (scopedOrgId && scopedOrgId !== orgId) {
    return "forbidden org scope";
  }

  if (m.kind === "completeTask" || m.kind === "deleteTask") {
    const task = memory.findTask(m.taskId);
    if (!task || task.orgId !== orgId) {
      return "forbidden task scope";
    }
  }

  if (m.kind === "removeOrgCoach" || m.kind === "restoreOrgCoach" || m.kind === "assignTask") {
    const snapshot = memory.getMockSnapshot(ctx);
    const org = snapshot.orgs.find((o) => o.id === orgId);
    if (!org) {
      return "organization not found";
    }
    const coachIds = new Set(orgCoaches(org).map((c) => c.id));
    const coachId = m.kind === "assignTask" ? m.coachId : m.coachId;
    if (!coachIds.has(coachId)) {
      return "forbidden coach scope";
    }
  }

  if (m.kind === "sendPaymentReminder") {
    const sub = memory.findSubscription(m.subscriptionId);
    if (!sub || sub.orgId !== orgId) {
      return "forbidden subscription scope";
    }
  }

  if (m.kind === "updateBranch") {
    const snapshot = memory.getMockSnapshot(ctx);
    const org = snapshot.orgs.find((o) => o.id === orgId);
    if (!org?.branches.some((b) => b.id === m.branchId)) {
      return "forbidden branch scope";
    }
  }

  // Lisans türleri kataloğu yalnız süper admin (role === "admin") yetkisindedir.
  if (
    m.kind === "addOrgPlan" ||
    m.kind === "updateOrgPlan" ||
    m.kind === "deleteOrgPlan" ||
    m.kind === "addCoachPlan" ||
    m.kind === "updateCoachPlan" ||
    m.kind === "deleteCoachPlan"
  ) {
    return "forbidden plan mutation for branch role";
  }

  // Öğrenci paketleri kurumun kendi sahipliğiyle sınırlı.
  if (m.kind === "addStudentPackage" || m.kind === "updateStudentPackage" || m.kind === "deleteStudentPackage") {
    const snapshot = memory.getMockSnapshot(ctx);
    if (m.kind === "addStudentPackage") {
      if (m.ownerKind !== "org" || m.ownerId !== orgId) {
        return "forbidden package scope";
      }
    } else {
      const pkg = snapshot.studentPackages.find((p) => p.id === m.packageId);
      if (!pkg || pkg.ownerKind !== "org" || pkg.ownerId !== orgId) {
        return "forbidden package scope";
      }
    }
  }

  return null;
}
