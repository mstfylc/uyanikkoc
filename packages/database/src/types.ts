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

export type TopicExamType = "TYT" | "AYT" | "LGS" | "GENEL";

export type TopicProgressRecord = {
  completed: boolean;
  completedAt: string | null;
  updatedAt: string;
};

export type TopicRecord = {
  id: string;
  subjectId: string;
  studentId: string;
  name: string;
  progress: TopicProgressRecord;
  createdAt: string;
  updatedAt: string;
};

export type SubjectRecord = {
  id: string;
  studentId: string;
  examType: TopicExamType;
  name: string;
  topics: TopicRecord[];
  createdAt: string;
  updatedAt: string;
};

export type TopicTrackingSummary = {
  totalTopics: number;
  completedTopics: number;
  completionRate: number;
};

export type CreateSubjectInput = {
  studentId: string;
  examType: TopicExamType;
  name: string;
};

export type CreateTopicInput = {
  subjectId: string;
  studentId: string;
  name: string;
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
