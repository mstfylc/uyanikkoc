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
  kind: "dm" | "group";
  name: string | null;
  title: string;
  memberUserIds?: string[];
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
  completedSources?: string[];
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

export type TopicStudySessionRecord = {
  id: string;
  topicId: string;
  studentId: string;
  subjectName: string;
  topicName: string;
  date: string;
  questionCount: number;
  correctCount: number;
  createdAt: string;
  updatedAt: string;
};

export type UpsertTopicStudySessionInput = {
  id?: string;
  topicId: string;
  studentId: string;
  date: string;
  questionCount: number;
  correctCount: number;
};

export type CoachTopicTargetsRecord = {
  coachId: string;
  studentId: string;
  targets: Record<string, number>;
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

export type AppointmentMode = "online" | "in_person" | "phone";
export type AppointmentStatus = "pending" | "approved" | "rejected" | "cancelled";
export type AppointmentDay = "Pzt" | "Sal" | "Car" | "Per" | "Cum" | "Cmt";

export type DenemeExamType = "TYT" | "AYT" | "LGS";
export type DenemeParticipationMode = "yuzyuze" | "online";
export type DenemePaymentKind = "paket" | "odendi";
export type DenemeMembershipId = "yuzyuze" | "kargo";

export type DenemeEvent = {
  id: string;
  coachId: string;
  name: string;
  examType: DenemeExamType;
  date: string;
  time: string;
  place: string;
  questionCount: number;
  price: number;
};

export type DenemeRegistration = {
  eventId: string;
  studentId: string;
  payment: DenemePaymentKind;
  mode: DenemeParticipationMode;
  registeredAt: number;
};

export type AppointmentRecord = {
  id: string;
  coachId: string;
  studentId: string;
  studentName: string;
  day: AppointmentDay;
  slot: string;
  mode: AppointmentMode;
  topic: string;
  requesterRole: "student" | "parent";
  status: AppointmentStatus;
  createdAt: string;
};

export type AppointmentSettingsRecord = {
  coachId: string;
  weeklyLimit: number;
  weeklyLimitStudent: number;
  weeklyLimitParent: number;
  allowOnline: boolean;
  allowInPerson: boolean;
  allowPhone: boolean;
  availability: Record<AppointmentDay, string[]>;
  slotModes: Record<AppointmentDay, Record<string, AppointmentMode[]>>;
};

export type PsychTestQuestion = {
  text: string;
  kind: "likert" | "yesno" | "scale" | "choice";
  options?: string[];
};

export type PsychTestDefinition = {
  id: string;
  name: string;
  icon: string;
  tone: "primary" | "success" | "warning" | "danger" | "info";
  description: string;
  questions: PsychTestQuestion[];
  bands: Array<[number, number, string, string]>;
  custom?: boolean;
  coachId?: string | null;
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

export type StudyBlockStatus = "todo" | "progress" | "done";

export type StudyBlockRecord = {
  id: string;
  day: string;
  time: string;
  subject: string;
  topic: string;
  type: string;
  status: StudyBlockStatus;
  source?: string;
  correct?: number;
  wrong?: number;
  net?: number;
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

export type SupportCategory = "teknik" | "oneri" | "hesap" | "diger";
export type SupportStatus = "open" | "answered" | "closed";

export type SupportTicketRecord = {
  id: string;
  userId: string;
  role: string;
  category: SupportCategory;
  message: string;
  status: SupportStatus;
  reply: string | null;
  createdAt: string;
};

export type CreateSupportTicketInput = {
  userId: string;
  role: string;
  category: SupportCategory;
  message: string;
};

export type CoachRatingRecord = {
  id: string;
  studentId: string;
  coachId: string;
  stars: number;
  comment: string | null;
  createdAt: string;
};

export type CoachRatingSummary = {
  average: number;
  count: number;
  ratings: (CoachRatingRecord & { studentName?: string })[];
};

export type UpsertRatingInput = {
  studentId: string;
  coachId: string;
  stars: number;
  comment?: string | null;
};

export type OnlineExamRecord = {
  id: string;
  title: string;
  publisher: string;
  examType: "TYT" | "AYT" | "LGS";
  questionCount: number;
  cargoStatus: string;
  branchId: string;
  createdAt: string;
  submission?: OptikSubmissionRecord | null;
};

export type OptikSubmissionRecord = {
  id: string;
  examId: string;
  studentId: string;
  answers: string[];
  correct: number;
  wrong: number;
  blank: number;
  net: number;
  createdAt: string;
};

export type CreateOnlineExamInput = {
  title: string;
  publisher: string;
  examType: "TYT" | "AYT" | "LGS";
  questionCount: number;
  answerKey: string[];
  branchId: string;
  cargoStatus?: string;
};

export type SubmitOptikInput = {
  examId: string;
  studentId: string;
  answers: (string | null)[];
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

export type ParentReportStatus = "pending" | "approved";

export type ParentReportRecord = {
  id: string;
  parentId: string;
  coachId?: string;
  studentId?: string;
  studentName: string;
  parentName: string;
  week: string;
  completion: number;
  netDelta: string;
  status: ParentReportStatus;
  sentAt: string | null;
};

export type MotivationMessageRecord = {
  id: string;
  studentId: string;
  coachId: string;
  body: string;
  createdAt: string;
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

export type CoachTaskPriority = "high" | "med" | "low";

export type CoachTaskRecord = {
  id: string;
  coachId: string;
  studentId: string | null;
  text: string;
  due: string | null;
  done: boolean;
  priority: CoachTaskPriority;
  createdAt: string;
};

export type CreateCoachTaskInput = {
  coachId: string;
  studentId?: string | null;
  text: string;
  due?: string | null;
  priority?: CoachTaskPriority;
};

export type CoachAnnouncementRecord = {
  id: string;
  coachId: string;
  title: string;
  body: string;
  audience: string;
  reach: number;
  createdAt: string;
};

export type CreateCoachAnnouncementInput = {
  coachId: string;
  title: string;
  body: string;
  audience: string;
};

export type AnnouncementTargets = {
  studentIds: string[];
  parentIds: string[];
};
