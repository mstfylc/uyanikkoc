import type { SchoolScheduleRecord } from "@uyanik/database";

import * as memorySchedule from "@/mocks/schedule";

export { SCHOOL_DAYS, SCHOOL_PERIODS } from "@/mocks/schedule";

export async function getStudentSchedule(studentId: string): Promise<SchoolScheduleRecord> {
  return memorySchedule.getSchoolSchedule(studentId);
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
