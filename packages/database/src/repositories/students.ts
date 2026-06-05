import { prisma } from "../client";
import type { MotivationSummary, StudentProfileRecord } from "../types";
import { buildExamTrendSummary, listExamResultsForStudent } from "./exams";
import { listSubjectsForStudent } from "./topics";

export async function getStudentProfile(studentId: string): Promise<StudentProfileRecord | null> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { id: true, motivationEnabled: true },
  });

  return profile;
}

export async function setStudentMotivationEnabled(
  studentId: string,
  enabled: boolean,
): Promise<StudentProfileRecord | null> {
  const existing = await prisma.studentProfile.findUnique({ where: { id: studentId } });
  if (!existing) {
    return null;
  }

  const profile = await prisma.studentProfile.update({
    where: { id: studentId },
    data: { motivationEnabled: enabled },
    select: { id: true, motivationEnabled: true },
  });

  return profile;
}

export async function getMotivationSummary(studentId: string): Promise<MotivationSummary> {
  const profile = await getStudentProfile(studentId);
  if (!profile?.motivationEnabled) {
    return { enabled: false, streakDays: 0, badges: [] };
  }

  const subjects = await listSubjectsForStudent(studentId);
  const exams = await listExamResultsForStudent(studentId);
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

  void buildExamTrendSummary(exams);

  return {
    enabled: true,
    streakDays,
    badges,
  };
}

export async function resolveStudentIdForParent(parentId: string): Promise<string | null> {
  const child = await prisma.studentProfile.findFirst({
    where: { parentId },
    select: { id: true },
  });

  return child?.id ?? null;
}
