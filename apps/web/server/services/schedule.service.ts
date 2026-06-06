import type { SchoolScheduleRecord } from "@uyanik/database";

import * as memorySchedule from "@/mocks/schedule";
import * as memoryStudyPlan from "@/mocks/study-plan";

export { SCHOOL_DAYS, SCHOOL_PERIODS } from "@/mocks/schedule";
export type { StudyBlockRecord } from "@/mocks/study-plan";

export async function getStudentSchedule(studentId: string): Promise<SchoolScheduleRecord> {
  return memorySchedule.getSchoolSchedule(studentId);
}

export async function getStudentStudyPlan(studentId: string) {
  return memoryStudyPlan.getStudyPlan(studentId);
}

export async function toggleStudentStudyBlock(studentId: string, blockId: string) {
  return memoryStudyPlan.toggleStudyBlock(studentId, blockId);
}

export async function updateStudentSchedule(
  studentId: string,
  patch: Partial<Pick<SchoolScheduleRecord, "attendsSchool" | "grid">>,
): Promise<SchoolScheduleRecord> {
  return memorySchedule.updateSchoolSchedule(studentId, patch);
}

export async function setStudentScheduleCell(
  studentId: string,
  day: string,
  period: number,
  value: string,
): Promise<SchoolScheduleRecord> {
  return memorySchedule.setScheduleCell(studentId, day, period, value);
}
