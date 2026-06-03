export type AssignmentType = "homework" | "exam_prep" | "reading" | "practice" | "other";
export type AssignmentPriority = "low" | "medium" | "high";
export type AssignmentStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type AssignmentCreateInput = {
  title: string;
  coachId: string;
  studentId: string;
  parentId: string;
  branchId: string;
  description?: string | null;
  type?: AssignmentType;
  priority?: AssignmentPriority;
  subject?: string | null;
  dueDate?: string | null;
};

export type AssignmentRecord = {
  id: string;
  title: string;
  description: string | null;
  type: AssignmentType;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  subject: string | null;
  dueDate: string | null;
  coachId: string;
  studentId: string;
  parentId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
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
