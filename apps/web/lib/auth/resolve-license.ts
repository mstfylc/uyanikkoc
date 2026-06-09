import type { License, LicenseOwnerType } from "@prisma/client";

import { prisma } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import type { SessionRoleSnapshot } from "@/lib/rbac";

export type LicenseResolutionReason =
  | "active"
  | "platform_admin_exempt"
  | "development_memory_bypass"
  | "role_not_licensed"
  | "missing_owner"
  | "not_found"
  | "inactive_status"
  | "expired";

export type LicenseResolution = {
  hasActiveLicense: boolean;
  license: License | null;
  reason: LicenseResolutionReason;
};

const ACTIVE_LICENSE_STATUSES = ["active", "trialing"] as const;

function isActiveLicense(license: License, now: Date): LicenseResolution {
  if (!ACTIVE_LICENSE_STATUSES.includes(license.status as (typeof ACTIVE_LICENSE_STATUSES)[number])) {
    return { hasActiveLicense: false, license, reason: "inactive_status" };
  }

  if (license.expiresAt != null && license.expiresAt.getTime() <= now.getTime()) {
    return { hasActiveLicense: false, license, reason: "expired" };
  }

  return { hasActiveLicense: true, license, reason: "active" };
}

export function resolveLicenseOwner(
  user: SessionRoleSnapshot["user"],
): { ownerType: LicenseOwnerType; ownerId: string } | { reason: "platform_admin_exempt" | "role_not_licensed" | "missing_owner" } {
  if (user.role === "admin") {
    return { reason: "platform_admin_exempt" };
  }

  if (user.role === "coach") {
    return user.coachId ? { ownerType: "coach", ownerId: user.coachId } : { reason: "missing_owner" };
  }

  if (user.role === "branch") {
    return user.organizationId
      ? { ownerType: "organization", ownerId: user.organizationId }
      : { reason: "missing_owner" };
  }

  return { reason: "role_not_licensed" };
}

export async function resolveActiveLicenseForUser(
  user: SessionRoleSnapshot["user"],
  now = new Date(),
): Promise<LicenseResolution> {
  const owner = resolveLicenseOwner(user);
  if ("reason" in owner) {
    return {
      hasActiveLicense: owner.reason === "platform_admin_exempt",
      license: null,
      reason: owner.reason,
    };
  }

  if (!shouldUseDatabase()) {
    if (process.env.NODE_ENV === "production") {
      return { hasActiveLicense: false, license: null, reason: "not_found" };
    }
    return { hasActiveLicense: true, license: null, reason: "development_memory_bypass" };
  }

  const activeLicense = await prisma.license.findFirst({
    where: {
      ownerType: owner.ownerType,
      ownerId: owner.ownerId,
      status: { in: ["active", "trialing"] },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ expiresAt: "desc" }, { createdAt: "desc" }],
  });

  if (activeLicense) {
    return { hasActiveLicense: true, license: activeLicense, reason: "active" };
  }

  const license = await prisma.license.findFirst({
    where: {
      ownerType: owner.ownerType,
      ownerId: owner.ownerId,
    },
    orderBy: [{ createdAt: "desc" }],
  });

  if (!license) {
    return { hasActiveLicense: false, license: null, reason: "not_found" };
  }

  return isActiveLicense(license, now);
}
