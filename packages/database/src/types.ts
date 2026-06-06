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
  inProgress?: boolean;
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

export type AppointmentMode = "online" | "in_person";
export type AppointmentStatus = "pending" | "approved" | "rejected" | "cancelled";
export type AppointmentDay = "Pzt" | "Sal" | "Car" | "Per" | "Cum" | "Cmt";

export type AppointmentRecord = {
  id: string;
  coachId: string;
  studentId: string;
  studentName: string;
  day: AppointmentDay;
  slot: string;
  mode: AppointmentMode;
  topic: string;
  status: AppointmentStatus;
  createdAt: string;
};

export type AppointmentSettingsRecord = {
  coachId: string;
  weeklyLimit: number;
  allowOnline: boolean;
  allowInPerson: boolean;
  availability: Record<AppointmentDay, string[]>;
};

export type PsychTestDefinition = {
  id: string;
  name: string;
  icon: string;
  tone: "primary" | "success" | "warning" | "danger" | "info";
  description: string;
  questions: string[];
  bands: Array<[number, number, string, string]>;
};

export type TestAssignmentStatus = "sent" | "completed";

export type TestAssignmentRecord = {
  id: string;
  coachId: string;
  studentId: string;
  studentName: string;
  testId: string;
  status: TestAssignmentStatus;
  score: number | null;
  band: string | null;
  bandTone: string | null;
  coachNote: string;
  sentAt: string;
  completedAt: string | null;
};

export type SchoolScheduleRecord = {
  studentId: string;
  attendsSchool: boolean;
  grid: Record<string, string[]>;
};

export type CoachNoteKind = "meeting" | "warning" | "general";

export type CoachStudentNoteRecord = {
  id: string;
  coachId: string;
  studentId: string;
  text: string;
  kind: CoachNoteKind;
  pinned: boolean;
  createdAt: string;
};

export type CurriculumTopicGroup = {
  name: string;
  topics: string[];
};

export type CurriculumRecord = {
  coachId: string;
  examType: TopicExamType;
  subjects: Record<string, CurriculumTopicGroup[]>;
};

export type SupportTicketRecord = {
  id: string;
  userId: string;
  role: string;
  subject: string;
  message: string;
  status: "open" | "closed";
  createdAt: string;
};

export type CoachReportStudentRow = {
  studentId: string;
  displayName: string;
  latestNet: number | null;
  assignmentRate: number;
  topicRate: number;
  examTrend: number[];
  risk: "excellent" | "normal" | "attention" | "critical";
};

export type ParentReportRecord = {
  id: string;
  studentName: string;
  parentName: string;
  week: string;
  completion: number;
  netDelta: string;
  status: "pending" | "approved";
};

export type CoachReportSummary = {
  rosterCount: number;
  avgExamNet: number | null;
  assignmentCompletionRate: number;
  pendingAppointments: number;
  pendingReports: number;
  classNetTrend: number[];
  classNetGain: number;
  atRiskCount: number;
  weekCompletion: Array<{ label: string; value: number }>;
  riskDistribution: Array<{ band: string; label: string; count: number; tone: string }>;
  parentReports: ParentReportRecord[];
  students: CoachReportStudentRow[];
};

export type BillingCycle = "monthly" | "annual";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";
export type InvoiceStatus = "paid" | "pending" | "failed";
export type CardBrand = "visa" | "mastercard";

export type BillingPlanRecord = {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  popular: boolean;
  features: string[];
  sortOrder: number;
};

export type PaymentMethodRecord = {
  id: string;
  userId: string;
  brand: CardBrand;
  last4: string;
  holder: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
};

export type SubscriptionRecord = {
  id: string;
  payerUserId: string;
  studentId: string | null;
  planId: string;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  autoRenew: boolean;
  startedAt: string;
  renewsAt: string;
  canceledAt: string | null;
  paymentMethodId: string | null;
};

export type InvoiceRecord = {
  id: string;
  subscriptionId: string;
  payerUserId: string;
  planId: string;
  cycle: BillingCycle;
  amount: number;
  status: InvoiceStatus;
  installments: number;
  methodLabel: string;
  paymentMethodId: string | null;
  issuedAt: string;
};

export type CreatePaymentMethodInput = {
  userId: string;
  brand: CardBrand;
  last4: string;
  holder: string;
  expMonth: number;
  expYear: number;
  makeDefault?: boolean;
};

export type CreateSubscriptionInput = {
  payerUserId: string;
  studentId?: string | null;
  planId: string;
  cycle: BillingCycle;
  paymentMethodId?: string | null;
  installments?: number;
};
