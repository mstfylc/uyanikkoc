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
export { buildTopicSummary } from "./repositories/topics";
export { buildExamTrendSummary } from "./repositories/exams";
export type {
  AssignmentCreateInput,
  AssignmentPriority,
  AssignmentRecord,
  AssignmentStatus,
  AssignmentType,
  AuthUserRecord,
  CreateSubjectInput,
  CreateTopicInput,
  ExamResultRecord,
  ExamSubjectResultRecord,
  ExamTrendSummary,
  ParentSummaryRecord,
  ResultExamType,
  SubjectRecord,
  TopicExamType,
  TopicProgressRecord,
  TopicRecord,
  TopicTrackingSummary,
} from "./types";
