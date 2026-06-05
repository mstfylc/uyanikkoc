import type { MotivationSummary, StudentProfileRecord } from "@uyanik/database";

import { DEMO_PARENT_ID, DEMO_STUDENT_ID, listAssignmentsForParent } from "@/mocks/assignments";
import { listExamResultsForStudent } from "@/mocks/exams";
import { listSubjectsForStudent } from "@/mocks/topics";

const globalStore = globalThis as typeof globalThis & {
  __uyanikMotivationProfiles?: Map<string, boolean>;
};

const profiles =
  globalStore.__uyanikMotivationProfiles ??
  (globalStore.__uyanikMotivationProfiles = new Map([[DEMO_STUDENT_ID, true]]));

export function resetMotivationForTests(): void {
  profiles.clear();
  profiles.set(DEMO_STUDENT_ID, true);
}

export function getStudentProfile(studentId: string): StudentProfileRecord {
  return {
    id: studentId,
    motivationEnabled: profiles.get(studentId) ?? true,
  };
}

export function setMotivationEnabled(
  studentId: string,
  enabled: boolean,
): StudentProfileRecord {
  profiles.set(studentId, enabled);
  return getStudentProfile(studentId);
}

export function getMotivationSummary(studentId: string): MotivationSummary {
  const profile = getStudentProfile(studentId);
  if (!profile.motivationEnabled) {
    return { enabled: false, streakDays: 0, badges: [] };
  }

  const subjects = listSubjectsForStudent(studentId);
  const exams = listExamResultsForStudent(studentId);
  const completedTopics = subjects.reduce(
    (sum, subject) => sum + subject.topics.filter((topic) => topic.progress.completed).length,
    0,
  );
  const badges: string[] = [];

  if (exams.length >= 1) {
    badges.push("Ilk deneme");
  }
  if (completedTopics >= 10) {
    badges.push("10 konu");
  }

  const streakDays = Math.min(completedTopics, 7) >= 7 ? 7 : Math.min(completedTopics, 7);

  if (streakDays >= 7) {
    badges.push("7 gun seri");
  }

  return {
    enabled: true,
    streakDays,
    badges,
  };
}

export function resolveStudentIdForParent(parentId: string): string | null {
  if (parentId === DEMO_PARENT_ID) {
    return DEMO_STUDENT_ID;
  }
  const parentAssignments = listAssignmentsForParent(parentId);
  return parentAssignments[0]?.studentId ?? null;
}
