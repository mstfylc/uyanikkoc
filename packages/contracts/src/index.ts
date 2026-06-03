export type OrganizationId = string;
export type BranchId = string;
export type UserId = string;

export type TenantContext = {
  organizationId: OrganizationId;
  branchId: BranchId;
};

export const CRM_ISOLATION_SCOPE = "branch" as const;
