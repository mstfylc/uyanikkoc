export {
  isDatabaseConfigured,
  prisma,
  shouldUseDatabase,
  useMemoryStore,
} from "./client";
export * as assignmentRepository from "./repositories/assignments";
export * as authRepository from "./repositories/auth";
export type {
  AssignmentRecord,
  AuthUserRecord,
  ParentSummaryRecord,
} from "./types";
