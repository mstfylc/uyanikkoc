export type {
  AssignmentCreateInput,
  AssignmentRecord,
  ParentSummaryRecord,
} from "@/server/services/assignment.service";

export { DEMO_PARENT_ID, DEMO_STUDENT_ID } from "@/mocks/assignments";

export {
  createCoachAssignment as createAssignment,
  listCoachAssignments as listAssignmentsForCoach,
  listStudentAssignments as listAssignmentsForStudent,
  completeStudentAssignment as completeAssignment,
  getParentAssignmentSummary as getParentSummary,
} from "@/server/services/assignment.service";
