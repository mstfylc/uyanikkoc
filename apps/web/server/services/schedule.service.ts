import type { SchoolScheduleRecord } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memorySchedule from "@/mocks/schedule";
import * as memoryStudyPlan from "@/mocks/study-plan";

export { SCHOOL_DAYS, SCHOOL_PERIODS } from "@/mocks/schedule";
export type { StudyBlockRecord } from "@/mocks/study-plan";

async function repo() {
  const { scheduleRepository } = await import("@uyanik/database");
  return scheduleRepository;
}

export async function getStudentSchedule(studentId: string): Promise<SchoolScheduleRecord> {
  if (shouldUseDatabase()) return (await repo()).getSchoolSchedule(studentId);
  return memorySchedule.getSchoolSchedule(studentId);
}

export async function getStudentStudyPlan(studentId: string) {
  if (shouldUseDatabase()) return (await repo()).getStudyPlan(studentId);
  return memoryStudyPlan.getStudyPlan(studentId);
}

export async function advanceStudentStudyBlock(
  studentId: string,
  blockId: string,
  action: "start" | "finish" | "reset",
) {
  if (shouldUseDatabase()) return (await repo()).advanceStudyBlock(studentId, blockId, action);
  return memoryStudyPlan.advanceStudyBlock(studentId, blockId, action);
}

export async function toggleStudentStudyBlock(studentId: string, blockId: string) {
  if (shouldUseDatabase()) return (await repo()).toggleStudyBlock(studentId, blockId);
  return memoryStudyPlan.toggleStudyBlock(studentId, blockId);
}

export async function addStudentStudyBlock(
  studentId: string,
  input: {
    day: string;
    time: string;
    subject: string;
    topic: string;
    type: string;
    source?: string;
    correct?: number;
    wrong?: number;
  },
) {
  if (shouldUseDatabase()) return (await repo()).addStudyBlock(studentId, input);
  return memoryStudyPlan.addStudyBlock(studentId, input);
}

export async function updateStudentSchedule(
  studentId: string,
  patch: Partial<Pick<SchoolScheduleRecord, "attendsSchool" | "grid">>,
): Promise<SchoolScheduleRecord> {
  if (shouldUseDatabase()) return (await repo()).updateSchoolSchedule(studentId, patch);
  return memorySchedule.updateSchoolSchedule(studentId, patch);
}

export async function setStudentScheduleCell(
  studentId: string,
  day: string,
  period: number,
  value: string,
): Promise<SchoolScheduleRecord> {
  if (shouldUseDatabase()) return (await repo()).setScheduleCell(studentId, day, period, value);
  return memorySchedule.setScheduleCell(studentId, day, period, value);
}
