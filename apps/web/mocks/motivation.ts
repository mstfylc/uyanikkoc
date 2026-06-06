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

export const MOTIVATION_BADGE_IDS = [
  "streak-7",
  "topics-10",
  "exam-up",
  "homework",
  "focus",
  "star",
  "streak-14",
  "topics-25",
  "schedule",
  "deneme-3",
  "coach-note",
  "perfect-week",
] as const;

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

  if (exams.length >= 1) badges.push("exam-up");
  if (exams.length >= 3) badges.push("deneme-3");
  if (completedTopics >= 10) badges.push("topics-10");
  if (completedTopics >= 25) badges.push("topics-25");

  const streakDays = Math.min(completedTopics, 14) >= 14 ? 14 : Math.min(completedTopics, 7);
  if (streakDays >= 7) badges.push("streak-7");
  if (streakDays >= 14) badges.push("streak-14");

  if (completedTopics >= 5) badges.push("focus");
  if (completedTopics >= 3) badges.push("schedule");
  if (studentId === DEMO_STUDENT_ID) {
    badges.push("homework", "star", "coach-note", "perfect-week");
  }

  return {
    enabled: true,
    streakDays: Math.min(streakDays, 14),
    badges: [...new Set(badges)],
  };
}

export function resolveStudentIdForParent(parentId: string): string | null {
  if (parentId === DEMO_PARENT_ID) {
    return DEMO_STUDENT_ID;
  }
  const parentAssignments = listAssignmentsForParent(parentId);
  return parentAssignments[0]?.studentId ?? null;
}
