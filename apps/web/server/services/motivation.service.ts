import type { MotivationSummary, StudentProfileRecord } from "@uyanik/database";
import type {
  AssignmentRecord,
  ExamTrendSummary,
  TopicTrackingSummary,
} from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryMotivation from "@/mocks/motivation";
import { coachHasStudent } from "@/server/services/roster.service";

export type CoachStudentSummary = {
  studentId: string;
  assignments: AssignmentRecord[];
  topicSummary: TopicTrackingSummary;
  examSummary: ExamTrendSummary;
  motivationEnabled: boolean;
  motivation: MotivationSummary;
};

export async function getStudentMotivationSummary(studentId: string): Promise<MotivationSummary> {
  if (shouldUseDatabase()) {
    const { studentRepository } = await import("@uyanik/database");
    return studentRepository.getMotivationSummary(studentId);
  }

  return memoryMotivation.getMotivationSummary(studentId);
}

export async function getStudentProfile(studentId: string): Promise<StudentProfileRecord | null> {
  if (shouldUseDatabase()) {
    const { studentRepository } = await import("@uyanik/database");
    return studentRepository.getStudentProfile(studentId);
  }

  return memoryMotivation.getStudentProfile(studentId);
}

export async function setStudentMotivationEnabled(
  studentId: string,
  enabled: boolean,
): Promise<StudentProfileRecord | null> {
  if (shouldUseDatabase()) {
    const { studentRepository } = await import("@uyanik/database");
    return studentRepository.setStudentMotivationEnabled(studentId, enabled);
  }

  return memoryMotivation.setMotivationEnabled(studentId, enabled);
}

export async function resolveStudentIdForParent(parentId: string): Promise<string | null> {
  if (shouldUseDatabase()) {
    const { studentRepository } = await import("@uyanik/database");
    return studentRepository.resolveStudentIdForParent(parentId);
  }

  return memoryMotivation.resolveStudentIdForParent(parentId);
}

export async function getCoachStudentSummary(
  coachId: string,
  studentId: string,
): Promise<CoachStudentSummary | null> {
  const hasStudent = await coachHasStudent(coachId, studentId);
  if (!hasStudent) {
    return null;
  }

  const { listCoachAssignments } = await import("@/server/services/assignment.service");
  const { listStudentTopics } = await import("@/server/services/topic.service");
  const { listStudentExams } = await import("@/server/services/exam.service");

  const assignments = await listCoachAssignments(coachId);
  const studentAssignments = assignments.filter((item) => item.studentId === studentId);
  const { summary: topicSummary } = await listStudentTopics(studentId);
  const { summary: examSummary } = await listStudentExams(studentId);
  const profile = await getStudentProfile(studentId);
  const motivation = await getStudentMotivationSummary(studentId);

  return {
    studentId,
    assignments: studentAssignments,
    topicSummary,
    examSummary,
    motivationEnabled: profile?.motivationEnabled ?? true,
    motivation,
  };
}
