export type AssignmentRecord = {
  id: string;
  title: string;
  coachId: string;
  studentId: string;
  parentId: string;
  branchId: string;
  createdAt: string;
  completed: boolean;
  completedAt: string | null;
};

export type ParentSummaryRecord = {
  totalAssignments: number;
  completedCount: number;
  pendingCount: number;
  assignments: AssignmentRecord[];
};

export type AuthUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: "STUDENT" | "COACH" | "PARENT" | "BRANCH_MANAGER" | "ORG_ADMIN";
  organizationId: string;
  branchId: string;
  studentId?: string | null;
  coachId?: string | null;
  parentId?: string | null;
};
