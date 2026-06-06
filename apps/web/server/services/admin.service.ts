// Admin service — DB/memory ayrımı (billing.service / notification.service deseni).
// apps/web/server/services/admin.service.ts
//
// NOT: Admin (kurum/franchise + süper admin) için Prisma şeması henüz yok.
// Bu service memory store (@/mocks/admin) üzerinden çalışır; DB eklendiğinde
// `shouldUseDatabase()` dalına `adminRepository` çağrıları yerleştirilir.

import { assertMutationAllowed } from "@/lib/admin/mutation-scope";
import type { AdminSnapshotContext } from "@/lib/admin/snapshot-context";
import { shouldUseDatabase } from "@/lib/data/env";
import type { AppRole } from "@uyanik/tokens";
import * as memory from "@/mocks/admin";
import type { AdminMutation, AdminSnapshot } from "@/lib/admin/types";

export class AdminMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminMutationError";
  }
}

// DB repository hazır olduğunda:
// async function repo() {
//   const { adminRepository } = await import("@uyanik/database");
//   return adminRepository;
// }

export async function getAdminSnapshot(ctx: AdminSnapshotContext = {}): Promise<AdminSnapshot> {
  // if (shouldUseDatabase()) return (await repo()).getSnapshot(ctx);
  void shouldUseDatabase;
  return memory.getMockSnapshot(ctx);
}

export async function applyAdminMutation(
  m: AdminMutation,
  ctx: AdminSnapshotContext = {},
  role: AppRole = "admin",
): Promise<AdminSnapshot> {
  const scopeError = assertMutationAllowed(m, ctx, role);
  if (scopeError) {
    throw new AdminMutationError(scopeError);
  }

  // if (shouldUseDatabase()) { await (await repo()).apply(m); return (await repo()).getSnapshot(ctx); }
  switch (m.kind) {
    case "renewOrg":
      memory.mockRenewOrg(m.orgId);
      break;
    case "renewOrgPlan":
      memory.mockRenewOrgPlan(m.orgId, m.months, m.planId);
      break;
    case "renewCoachPlan":
      memory.mockRenewCoachPlan(m.coachId, m.months, m.planId);
      break;
    case "suspendOrg":
      memory.mockSuspendOrg(m.orgId);
      break;
    case "activateOrg":
      memory.mockActivateOrg(m.orgId);
      break;
    case "changeOrgPlan":
      memory.mockChangeOrgPlan(m.orgId, m.planId);
      break;
    case "addOrgSeats":
      memory.mockAddOrgSeats(m.orgId, m.count);
      break;
    case "toggleOrgModule":
      memory.mockToggleOrgModule(m.orgId, m.moduleKey);
      break;
    case "updateOrgProfile":
      memory.mockUpdateOrgProfile(m.orgId, {
        name: m.name,
        tone: m.tone,
        email: m.email,
        phone: m.phone,
        ownerName: m.ownerName,
      });
      break;
    case "suspendCoach":
      memory.mockSuspendCoach(m.coachId);
      break;
    case "activateCoach":
      memory.mockActivateCoach(m.coachId);
      break;
    case "assignTask":
      memory.mockAssignTask(m.orgId, m.coachId, {
        title: m.title,
        detail: m.detail,
        due: m.due,
        priority: m.priority,
      });
      break;
    case "completeTask":
      memory.mockCompleteTask(m.taskId);
      break;
    case "deleteTask":
      memory.mockDeleteTask(m.taskId);
      break;
    case "removeOrgCoach":
      memory.mockRemoveOrgCoach(m.coachId);
      break;
    case "restoreOrgCoach":
      memory.mockRestoreOrgCoach(m.coachId);
      break;
    case "inviteOrgManager":
      memory.mockInviteOrgManager(m.orgId, { name: m.name, email: m.email, role: m.role });
      break;
    case "removeOrgManager":
      memory.mockRemoveOrgManager(m.orgId, m.managerId);
      break;
    case "setOrgManagerRole":
      memory.mockSetOrgManagerRole(m.orgId, m.managerId, m.role);
      break;
    case "inviteAdminMember":
      memory.mockInviteAdminMember({ name: m.name, email: m.email, access: m.access });
      break;
    case "removeAdminMember":
      memory.mockRemoveAdminMember(m.memberId);
      break;
    case "setAdminAccess":
      memory.mockSetAdminAccess(m.memberId, m.access);
      break;
    case "replyTicket":
      memory.mockReplyTicket(m.ticketId, m.text, m.author);
      break;
    case "setTicketStatus":
      memory.mockSetTicketStatus(m.ticketId, m.status);
      break;
    case "addSystemNote":
      memory.mockAddSystemNote(m.text, m.author);
      break;
    case "deleteSystemNote":
      memory.mockDeleteSystemNote(m.noteId);
      break;
    case "addLicenseNote":
      memory.mockAddLicenseNote(m.subjectKind, m.subjectId, m.text, m.author);
      break;
    case "deleteLicenseNote":
      memory.mockDeleteLicenseNote(m.noteId);
      break;
    case "grantDemo":
      memory.mockGrantDemo(m.subjectKind, m.subjectId, m.days, m.author);
      break;
    case "createCampaign":
      memory.mockCreateCampaign({
        name: m.name,
        code: m.code,
        type: m.type,
        value: m.value,
        audience: m.audience,
        startsAt: m.startsAt,
        endsAt: m.endsAt,
        maxRedemptions: m.maxRedemptions,
        note: m.note,
      });
      break;
    case "setCampaignStatus":
      memory.mockSetCampaignStatus(m.campaignId, m.status);
      break;
    case "deleteCampaign":
      memory.mockDeleteCampaign(m.campaignId);
      break;
    case "grantCampaign":
      memory.mockGrantCampaign(m.campaignId, m.subjectKind, m.subjectId);
      break;
    case "setActiveOrg":
      // Aktif kurum oturum bağlamıdır; memory store'da kalıcı tutulmaz (UI tarafında).
      break;
    case "addBranch":
      memory.mockAddBranch(m.orgId, m.name, m.city);
      break;
    case "updateBranch":
      memory.mockUpdateBranch(m.orgId, m.branchId, {
        name: m.name,
        city: m.city,
        status: m.status,
      });
      break;
    case "sendPaymentReminder":
      memory.mockSendPaymentReminder(m.subscriptionId);
      break;
    case "buyCoachPlan":
      memory.mockBuyCoachPlan(m.coachId, m.planId, m.cycle);
      break;
    case "setCoachAutoRenew":
      memory.mockSetCoachAutoRenew(m.coachId, m.enabled);
      break;
    case "cancelCoach":
      memory.mockCancelCoach(m.coachId);
      break;
    case "updateOrgBilling":
      memory.mockUpdateOrgBilling(m.orgId, {
        taxId: m.taxId,
        taxOffice: m.taxOffice,
        billingAddress: m.billingAddress,
        paymentMethod: m.paymentMethod,
      });
      break;
    case "updateOrgNotifications":
      memory.mockUpdateOrgNotifications(m.orgId, m.prefs);
      break;
    case "requestDataExport":
      memory.mockRequestDataExport(m.orgId, m.note);
      break;
    case "cancelOrgSubscription":
      memory.mockCancelOrgSubscription(m.orgId);
      break;
    case "createOrg":
      memory.mockCreateOrg({
        name: m.name,
        city: m.city,
        type: m.type,
        planId: m.planId,
        ownerName: m.ownerName,
        ownerEmail: m.ownerEmail,
        ownerPhone: m.ownerPhone,
      });
      break;
    case "inviteOrgCoach":
      memory.mockInviteOrgCoach(m.orgId, { name: m.name, email: m.email, branchId: m.branchId });
      break;
    case "inviteStudent":
      memory.mockInviteStudent(m.orgId, {
        name: m.name,
        parentEmail: m.parentEmail,
        branchId: m.branchId,
      });
      break;
    case "resetDemo":
      memory.resetMockStore();
      break;
    default: {
      const _exhaustive: never = m;
      void _exhaustive;
    }
  }
  return memory.getMockSnapshot(ctx);
}
