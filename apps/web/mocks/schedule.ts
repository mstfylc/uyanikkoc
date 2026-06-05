import type { SchoolScheduleRecord } from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";

export const SCHOOL_DAYS = ["Pzt", "Sal", "Car", "Per", "Cum"];
export const SCHOOL_PERIODS = 8;

const globalStore = globalThis as typeof globalThis & {
  __uyanikSchedules?: Record<string, SchoolScheduleRecord>;
};

const schedules = globalStore.__uyanikSchedules ?? (globalStore.__uyanikSchedules = {});

function emptyGrid(): Record<string, string[]> {
  return Object.fromEntries(SCHOOL_DAYS.map((day) => [day, Array(SCHOOL_PERIODS).fill("")]));
}

function seedIfEmpty(studentId: string) {
  if (schedules[studentId]) {
    return;
  }

  if (studentId !== DEMO_STUDENT_ID) {
    schedules[studentId] = { studentId, attendsSchool: false, grid: emptyGrid() };
    return;
  }

  schedules[studentId] = {
    studentId,
    attendsSchool: true,
    grid: {
      Pzt: ["Matematik", "Matematik", "Fizik", "Turkce", "Kimya", "Beden", "", ""],
      Sal: ["Turkce", "Biyoloji", "Biyoloji", "Matematik", "Tarih", "Din", "", ""],
      Car: ["Fizik", "Fizik", "Matematik", "Kimya", "Turkce", "Ingilizce", "", ""],
      Per: ["Kimya", "Matematik", "Turkce", "Biyoloji", "Cografya", "Rehberlik", "", ""],
      Cum: ["Matematik", "Turkce", "Fizik", "Edebiyat", "Beden", "", "", ""],
    },
  };
}

export function getSchoolSchedule(studentId: string): SchoolScheduleRecord {
  seedIfEmpty(studentId);
  return schedules[studentId];
}

export function updateSchoolSchedule(
  studentId: string,
  patch: Partial<Pick<SchoolScheduleRecord, "attendsSchool" | "grid">>,
): SchoolScheduleRecord {
  const current = getSchoolSchedule(studentId);
  schedules[studentId] = {
    ...current,
    ...patch,
    studentId,
  };
  return schedules[studentId];
}

export function setScheduleCell(
  studentId: string,
  day: string,
  period: number,
  value: string,
): SchoolScheduleRecord {
  const current = getSchoolSchedule(studentId);
  const grid = { ...current.grid };
  grid[day] = (grid[day] ?? Array(SCHOOL_PERIODS).fill("")).slice();
  grid[day][period] = value;
  return updateSchoolSchedule(studentId, { grid });
}
