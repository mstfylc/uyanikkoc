import type {
  AppointmentRecord,
  AssignmentCreateInput,
  AssignmentRecord,
  CoachStudentNoteRecord,
  ParentSummaryRecord,
} from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import {
  completeAssignment as completeMemoryAssignment,
  createAssignment as createMemoryAssignment,
  getParentSummary as getMemoryParentSummary,
  listAssignmentsForParent as listMemoryAssignmentsForParent,
  listAssignmentsForStudent as listMemoryAssignmentsForStudent,
  listAssignmentsForCoach as listMemoryAssignmentsForCoach,
} from "@/mocks/assignments";
import { coachHasStudent, resolveParentIdForStudent } from "@/server/services/roster.service";

export type { AssignmentCreateInput, AssignmentRecord, ParentSummaryRecord };

export type CoachCreateAssignmentBody = Partial<
  Pick<AssignmentCreateInput, "description" | "type" | "priority" | "subject" | "dueDate" | "studentId">
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
  const studentId = body.studentId?.trim();
  if (!studentId) {
    throw new Error("Student is required");
  }

  const hasStudent = await coachHasStudent(coachId, studentId);
  if (!hasStudent) {
    throw new Error("Student not in roster");
  }

  const parentId = await resolveParentIdForStudent(studentId);
  if (!parentId) {
    throw new Error("Parent not found for student");
  }

  return createAssignment({
    title: body.title,
    coachId,
    studentId,
    parentId,
    branchId,
    description: body.description ?? null,
    type: body.type,
    priority: body.priority,
    subject: body.subject ?? null,
    dueDate: body.dueDate ?? null,
  });
}

export async function listStudentAssignments(studentId: string): Promise<
  Array<
    AssignmentRecord & {
      result?: { correct: number; wrong: number; blank: number; net: number } | null;
    }
  >
> {
  const items = await listAssignmentsForStudent(studentId);
  if (shouldUseDatabase()) {
    return items;
  }

  const { getAssignmentResult } = await import("@/mocks/assignments");
  return items.map((item) => ({
    ...item,
    result: getAssignmentResult(item.id),
  }));
}

export async function completeStudentAssignment(
  assignmentId: string,
  studentId: string,
): Promise<AssignmentRecord | null> {
  return completeAssignment(assignmentId, studentId);
}

export async function submitStudentAssignmentResult(
  assignmentId: string,
  studentId: string,
  input: { correct: number; wrong: number; blank: number },
): Promise<{ assignment: AssignmentRecord; result: import("@/mocks/assignments").AssignmentResultRecord } | null> {
  if (shouldUseDatabase()) {
    const { assignmentRepository } = await import("@uyanik/database");
    const completed = await assignmentRepository.submitAssignmentResult(assignmentId, studentId, input);
    return completed
      ? { assignment: completed, result: { correct: input.correct, wrong: input.wrong, blank: input.blank, net: input.correct - input.wrong / 4 } }
      : null;
  }

  const { submitAssignmentResult } = await import("@/mocks/assignments");
  return submitAssignmentResult(assignmentId, studentId, input);
}

async function resolveStudentIdForParent(parentId: string): Promise<string | null> {
  if (shouldUseDatabase()) {
    const { studentRepository } = await import("@uyanik/database");
    return studentRepository.resolveStudentIdForParent(parentId);
  }

  const parentAssignments = listMemoryAssignmentsForParent(parentId);
  return parentAssignments[0]?.studentId ?? null;
}

export type ParentDashboardSummary = ParentSummaryRecord & {
  pinnedNotes: CoachStudentNoteRecord[];
  nextAppointment: AppointmentRecord | null;
  childDisplayName: string;
  studyStreakDays: number;
};

export async function getParentAssignmentSummary(parentId: string): Promise<ParentDashboardSummary> {
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
      pinnedNotes: [],
      nextAppointment: null,
      childDisplayName: "Ogrenci",
      studyStreakDays: 0,
    };
  }

  const { listCoachStudents, resolveCoachIdForStudent } = await import("@/mocks/roster");
  const { getStudentMotivationSummary } = await import("@/server/services/motivation.service");

  const { listStudentTopics } = await import("@/server/services/topic.service");
  const { listStudentExams } = await import("@/server/services/exam.service");
  const { summary: topicSummary } = await listStudentTopics(studentId);
  const { summary: examSummary } = await listStudentExams(studentId);

  const { listPinnedNotesForStudent } = await import("@/mocks/coach-notes");
  const { listAppointmentsForStudent } = await import("@/mocks/appointments");
  const pinnedNotes = shouldUseDatabase() ? [] : listPinnedNotesForStudent(studentId);
  const nextAppointment =
    shouldUseDatabase()
      ? null
      : listAppointmentsForStudent(studentId).find((item) => item.status === "approved") ?? null;
  const coachId = resolveCoachIdForStudent(studentId);
  const childDisplayName =
    listCoachStudents(coachId ?? "coach_001").find((entry) => entry.studentId === studentId)?.displayName ??
    "Ogrenci";
  const motivation = await getStudentMotivationSummary(studentId);

  return {
    ...base,
    topicCompletionRate: topicSummary.completionRate,
    topicCompletedCount: topicSummary.completedTopics,
    topicTotalCount: topicSummary.totalTopics,
    latestExamNet: examSummary.latestNet,
    latestExamType: examSummary.examType,
    examTrend: examSummary.trend,
    pinnedNotes,
    nextAppointment,
    childDisplayName,
    studyStreakDays: motivation.streakDays,
  };
}
