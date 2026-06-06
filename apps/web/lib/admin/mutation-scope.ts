import type { AppRole } from "@uyanik/tokens";

import { orgCoaches } from "@/lib/admin/derive";
import { resolveOrgCoachId, type AdminSnapshotContext } from "@/lib/admin/snapshot-context";
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
    if (m.kind !== "completeTask") {
      return "forbidden mutation for coach role";
    }
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

  return null;
}
