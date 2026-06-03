import type { AssignmentRecord, ParentSummaryRecord } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import {
  completeAssignment as completeMemoryAssignment,
  createAssignment as createMemoryAssignment,
  getParentSummary as getMemoryParentSummary,
  listAssignmentsForStudent as listMemoryAssignmentsForStudent,
  listAssignmentsForCoach as listMemoryAssignmentsForCoach,
} from "@/mocks/assignments";

export type { AssignmentRecord, ParentSummaryRecord };

export { DEMO_PARENT_ID, DEMO_STUDENT_ID } from "@/mocks/assignments";

export async function createAssignment(input: {
  title: string;
  coachId: string;
  studentId: string;
  parentId: string;
  branchId: string;
}): Promise<AssignmentRecord> {
  if (shouldUseDatabase()) {
    const { assignmentRepository } = await import("@uyanik/database");
    return assignmentRepository.createAssignment(input);
  }

  return createMemoryAssignment(input);
}

export async function listAssignmentsForStudent(studentId: string): Promise<AssignmentRecord[]> {
  if (shouldUseDatabase()) {
    const { assignmentRepository } = await import("@uyanik/database");
    return assignmentRepository.listAssignmentsForStudent(studentId);
  }

  return listMemoryAssignmentsForStudent(studentId);
}

export async function listAssignmentsForCoach(coachId: string): Promise<AssignmentRecord[]> {
  if (shouldUseDatabase()) {
    const { assignmentRepository } = await import("@uyanik/database");
    return assignmentRepository.listAssignmentsForCoach(coachId);
  }

  return listMemoryAssignmentsForCoach(coachId);
}

export async function completeAssignment(
  assignmentId: string,
  studentId: string,
): Promise<AssignmentRecord | null> {
  if (shouldUseDatabase()) {
    const { assignmentRepository } = await import("@uyanik/database");
    return assignmentRepository.completeAssignment(assignmentId, studentId);
  }

  return completeMemoryAssignment(assignmentId, studentId);
}

export async function getParentSummary(parentId: string): Promise<ParentSummaryRecord> {
  if (shouldUseDatabase()) {
    const { assignmentRepository } = await import("@uyanik/database");
    return assignmentRepository.getParentSummary(parentId);
  }

  return getMemoryParentSummary(parentId);
}
