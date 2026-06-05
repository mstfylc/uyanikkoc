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
  topicCompletionRate: number;
  topicCompletedCount: number;
  topicTotalCount: number;
  latestExamNet: number | null;
  latestExamType: ResultExamType | null;
  examTrend: "up" | "down" | "flat";
};

export type NotificationRecord = {
  id: string;
  studentId: string | null;
  parentId: string | null;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type MessageRecord = {
  id: string;
  threadId: string;
  senderRole: "STUDENT" | "COACH" | "PARENT" | "BRANCH_MANAGER" | "ORG_ADMIN";
  body: string;
  createdAt: string;
};

export type MessageThreadRecord = {
  id: string;
  coachId: string;
  studentId: string | null;
  parentId: string | null;
  title: string;
  messages: MessageRecord[];
  createdAt: string;
  updatedAt: string;
};

export type AssignmentTemplateRecord = {
  id: string;
  coachId: string;
  title: string;
  description: string | null;
  type: AssignmentType;
  priority: AssignmentPriority;
  subject: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAssignmentTemplateInput = {
  coachId: string;
  title: string;
  description?: string | null;
  type?: AssignmentType;
  priority?: AssignmentPriority;
  subject?: string | null;
};

export type CreateExamResultInput = {
  studentId: string;
  examType: ResultExamType;
  label?: string | null;
  takenAt: string;
  subjects: Array<{
    subjectName: string;
    correct: number;
    wrong: number;
  }>;
};

export type MotivationSummary = {
  enabled: boolean;
  streakDays: number;
  badges: string[];
};

export type StudentProfileRecord = {
  id: string;
  motivationEnabled: boolean;
};

export type CoachRosterEntry = {
  studentId: string;
  displayName: string;
  email: string;
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

export type ResultExamType = "TYT" | "AYT" | "LGS";

export type ExamSubjectResultRecord = {
  id: string;
  subjectName: string;
  correct: number;
  wrong: number;
  net: number;
};

export type ExamResultRecord = {
  id: string;
  studentId: string;
  examType: ResultExamType;
  label: string | null;
  takenAt: string;
  totalNet: number;
  subjects: ExamSubjectResultRecord[];
  createdAt: string;
  updatedAt: string;
};

export type ExamTrendSummary = {
  latestNet: number | null;
  previousNet: number | null;
  trend: "up" | "down" | "flat";
  examType: ResultExamType | null;
  takenAt: string | null;
  examCount: number;
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
