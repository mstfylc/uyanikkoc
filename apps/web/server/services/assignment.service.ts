import type { AssignmentCreateInput, AssignmentRecord, ParentSummaryRecord } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import {
  DEMO_PARENT_ID,
  DEMO_STUDENT_ID,
  completeAssignment as completeMemoryAssignment,
  createAssignment as createMemoryAssignment,
  getParentSummary as getMemoryParentSummary,
  listAssignmentsForParent as listMemoryAssignmentsForParent,
  listAssignmentsForStudent as listMemoryAssignmentsForStudent,
  listAssignmentsForCoach as listMemoryAssignmentsForCoach,
} from "@/mocks/assignments";

export type { AssignmentCreateInput, AssignmentRecord, ParentSummaryRecord };

export type CoachCreateAssignmentBody = Partial<
  Pick<AssignmentCreateInput, "description" | "type" | "priority" | "subject" | "dueDate">
> & {
  title: string;
};

async function createAssignment(input: AssignmentCreateInput): Promise<AssignmentRecord> {
  if (shouldUseDatabase()) {
    const { assignmentRepository } = await import("@uyanik/database");
    return assignmentRepository.createAssignment(input);
  }

  return createMemoryAssignment(input);
}

async function listAssignmentsForStudent(studentId: string): Promise<AssignmentRecord[]> {
  if (shouldUseDatabase()) {
    const { assignmentRepository } = await import("@uyanik/database");
    return assignmentRepository.listAssignmentsForStudent(studentId);
  }

  return listMemoryAssignmentsForStudent(studentId);
}

async function listAssignmentsForCoach(coachId: string): Promise<AssignmentRecord[]> {
  if (shouldUseDatabase()) {
    const { assignmentRepository } = await import("@uyanik/database");
    return assignmentRepository.listAssignmentsForCoach(coachId);
  }

  return listMemoryAssignmentsForCoach(coachId);
}

async function completeAssignment(
  assignmentId: string,
  studentId: string,
): Promise<AssignmentRecord | null> {
  if (shouldUseDatabase()) {
    const { assignmentRepository } = await import("@uyanik/database");
    return assignmentRepository.completeAssignment(assignmentId, studentId);
  }

  return completeMemoryAssignment(assignmentId, studentId);
}

type ParentAssignmentBase = Pick<
  ParentSummaryRecord,
  "totalAssignments" | "completedCount" | "pendingCount" | "assignments"
>;

async function getParentSummary(parentId: string): Promise<ParentAssignmentBase> {
  if (shouldUseDatabase()) {
    const { assignmentRepository } = await import("@uyanik/database");
    return assignmentRepository.getParentSummary(parentId);
  }

  return getMemoryParentSummary(parentId);
}

export async function listCoachAssignments(coachId: string): Promise<AssignmentRecord[]> {
  return listAssignmentsForCoach(coachId);
}

export async function createCoachAssignment(
  coachId: string,
  branchId: string,
  body: CoachCreateAssignmentBody,
): Promise<AssignmentRecord> {
  return createAssignment({
    title: body.title,
    coachId,
    studentId: DEMO_STUDENT_ID,
    parentId: DEMO_PARENT_ID,
    branchId,
    description: body.description ?? null,
    type: body.type,
    priority: body.priority,
    subject: body.subject ?? null,
    dueDate: body.dueDate ?? null,
  });
}

export async function listStudentAssignments(studentId: string): Promise<AssignmentRecord[]> {
  return listAssignmentsForStudent(studentId);
}

export async function completeStudentAssignment(
  assignmentId: string,
  studentId: string,
): Promise<AssignmentRecord | null> {
  return completeAssignment(assignmentId, studentId);
}

async function resolveStudentIdForParent(parentId: string): Promise<string | null> {
  if (parentId === DEMO_PARENT_ID) {
    return DEMO_STUDENT_ID;
  }

  if (shouldUseDatabase()) {
    const { studentRepository } = await import("@uyanik/database");
    return studentRepository.resolveStudentIdForParent(parentId);
  }

  const parentAssignments = listMemoryAssignmentsForParent(parentId);
  return parentAssignments[0]?.studentId ?? null;
}

export async function getParentAssignmentSummary(parentId: string): Promise<ParentSummaryRecord> {
  const base = await getParentSummary(parentId);
  const studentId = await resolveStudentIdForParent(parentId);

  if (!studentId) {
    return {
      ...base,
      topicCompletionRate: 0,
      topicCompletedCount: 0,
      topicTotalCount: 0,
      latestExamNet: null,
      latestExamType: null,
      examTrend: "flat",
    };
  }

  const { listStudentTopics } = await import("@/server/services/topic.service");
  const { listStudentExams } = await import("@/server/services/exam.service");
  const { summary: topicSummary } = await listStudentTopics(studentId);
  const { summary: examSummary } = await listStudentExams(studentId);

  return {
    ...base,
    topicCompletionRate: topicSummary.completionRate,
    topicCompletedCount: topicSummary.completedTopics,
    topicTotalCount: topicSummary.totalTopics,
    latestExamNet: examSummary.latestNet,
    latestExamType: examSummary.examType,
    examTrend: examSummary.trend,
  };
}
