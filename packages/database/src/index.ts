export {
  isDatabaseConfigured,
  prisma,
  shouldUseDatabase,
  useMemoryStore,
} from "./client";
export * as assignmentRepository from "./repositories/assignments";
export * as authRepository from "./repositories/auth";
export * as topicRepository from "./repositories/topics";
export * as examRepository from "./repositories/exams";
export * as notificationRepository from "./repositories/notifications";
export * as messageRepository from "./repositories/messages";
export * as templateRepository from "./repositories/templates";
export * as studentRepository from "./repositories/students";
export * as rosterRepository from "./repositories/roster";
export { buildExamTrendSummary, computeSubjectNet, computeTotalNet } from "./repositories/exams";
export { buildTopicSummary } from "./repositories/topics";
export type {
  AssignmentCreateInput,
  AssignmentPriority,
  AssignmentRecord,
  AssignmentStatus,
  AssignmentTemplateRecord,
  AssignmentType,
  AuthUserRecord,
  CoachRosterEntry,
  CreateAssignmentTemplateInput,
  CreateExamResultInput,
  CreateSubjectInput,
  CreateTopicInput,
  ExamResultRecord,
  ExamSubjectResultRecord,
  ExamTrendSummary,
  MessageRecord,
  MessageThreadRecord,
  MotivationSummary,
  NotificationRecord,
  ParentSummaryRecord,
  ResultExamType,
  StudentProfileRecord,
  SubjectRecord,
  TopicExamType,
  TopicProgressRecord,
  TopicRecord,
  TopicTrackingSummary,
  AppointmentRecord,
  AppointmentSettingsRecord,
  AppointmentDay,
  AppointmentMode,
  AppointmentStatus,
  PsychTestDefinition,
  TestAssignmentRecord,
  TestAssignmentStatus,
  SchoolScheduleRecord,
  CoachStudentNoteRecord,
  CoachNoteKind,
  CurriculumRecord,
  CurriculumTopicGroup,
  SupportTicketRecord,
  CoachReportSummary,
  CoachReportStudentRow,
  ParentReportRecord,
} from "./types";
