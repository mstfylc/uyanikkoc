export {
  isDatabaseConfigured,
  prisma,
  shouldUseDatabase,
  useMemoryStore,
} from "./client";
export * as assignmentRepository from "./repositories/assignments";
export * as authRepository from "./repositories/auth";
export * as topicRepository from "./repositories/topics";
export { buildTopicSummary } from "./repositories/topics";
export type {
  AssignmentCreateInput,
  AssignmentPriority,
  AssignmentRecord,
  AssignmentStatus,
  AssignmentType,
  AuthUserRecord,
  CreateSubjectInput,
  CreateTopicInput,
  ParentSummaryRecord,
  SubjectRecord,
  TopicExamType,
  TopicProgressRecord,
  TopicRecord,
  TopicTrackingSummary,
} from "./types";
