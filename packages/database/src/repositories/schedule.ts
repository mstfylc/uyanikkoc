import { prisma } from "../client";
import type { SchoolScheduleRecord, StudyBlockRecord, StudyBlockStatus } from "../types";

const SCHOOL_DAYS = ["Pzt", "Sal", "Car", "Per", "Cum"];
const SCHOOL_PERIODS = 8;

function emptyGrid(): Record<string, string[]> {
  return Object.fromEntries(SCHOOL_DAYS.map((day) => [day, Array(SCHOOL_PERIODS).fill("")]));
}

function mapBlock(block: {
  id: string;
  day: string;
  time: string;
  endTime: string | null;
  subject: string;
  topic: string;
  type: string;
  status: StudyBlockStatus;
  source: string | null;
  correct: number | null;
  wrong: number | null;
  net: number | null;
}): StudyBlockRecord {
  return {
    id: block.id,
    endTime: block.endTime ?? undefined,
    day: block.day,
    time: block.time,
    subject: block.subject,
    topic: block.topic,
    type: block.type,
    status: block.status,
    source: block.source ?? undefined,
    correct: block.correct ?? undefined,
    wrong: block.wrong ?? undefined,
    net: block.net ?? undefined,
  };
}

// --- Okul ders programı (grid) ---

export async function getSchoolSchedule(studentId: string): Promise<SchoolScheduleRecord> {
  const row = await prisma.studentSchedule.findUnique({ where: { studentId } });
  if (!row) {
    return { studentId, attendsSchool: false, grid: emptyGrid() };
  }
  return {
    studentId,
    attendsSchool: row.attendsSchool,
    grid: row.grid as Record<string, string[]>,
  };
}

export async function updateSchoolSchedule(
  studentId: string,
  patch: Partial<Pick<SchoolScheduleRecord, "attendsSchool" | "grid">>,
): Promise<SchoolScheduleRecord> {
  const current = await getSchoolSchedule(studentId);
  const next = {
    attendsSchool: patch.attendsSchool ?? current.attendsSchool,
    grid: patch.grid ?? current.grid,
  };
  await prisma.studentSchedule.upsert({
    where: { studentId },
    create: { studentId, attendsSchool: next.attendsSchool, grid: next.grid },
    update: { attendsSchool: next.attendsSchool, grid: next.grid },
  });
  return { studentId, ...next };
}

export async function setScheduleCell(
  studentId: string,
  day: string,
  period: number,
  value: string,
): Promise<SchoolScheduleRecord> {
  const current = await getSchoolSchedule(studentId);
  const grid = { ...current.grid };
  grid[day] = (grid[day] ?? Array(SCHOOL_PERIODS).fill("")).slice();
  grid[day][period] = value;
  return updateSchoolSchedule(studentId, { grid });
}

// --- Çalışma planı blokları ---

export async function getStudyPlan(studentId: string): Promise<StudyBlockRecord[]> {
  const rows = await prisma.studyBlock.findMany({
    where: { studentId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapBlock);
}

export async function advanceStudyBlock(
  studentId: string,
  blockId: string,
  action: "start" | "finish" | "reset",
): Promise<StudyBlockRecord | null> {
  const existing = await prisma.studyBlock.findFirst({ where: { id: blockId, studentId } });
  if (!existing) return null;
  const status: StudyBlockStatus =
    action === "start" ? "progress" : action === "finish" ? "done" : "todo";
  const row = await prisma.studyBlock.update({ where: { id: blockId }, data: { status } });
  return mapBlock(row);
}

export async function toggleStudyBlock(
  studentId: string,
  blockId: string,
): Promise<StudyBlockRecord | null> {
  const existing = await prisma.studyBlock.findFirst({ where: { id: blockId, studentId } });
  if (!existing) return null;
  const action = existing.status === "todo" ? "start" : existing.status === "progress" ? "finish" : "reset";
  return advanceStudyBlock(studentId, blockId, action);
}

export async function addStudyBlock(
  studentId: string,
  input: {
    day: string;
    time: string;
    endTime?: string;
    subject: string;
    topic: string;
    type: string;
    source?: string;
    correct?: number;
    wrong?: number;
  },
): Promise<StudyBlockRecord> {
  const correct = input.correct ?? 0;
  const wrong = input.wrong ?? 0;
  const row = await prisma.studyBlock.create({
    data: {
      studentId,
      day: input.day,
      time: input.time,
      endTime: input.endTime?.trim() || null,
      subject: input.subject.trim(),
      topic: input.topic.trim(),
      type: input.type.trim() || "Soru",
      status: "todo",
      source: input.source?.trim() || null,
      correct: correct || null,
      wrong: wrong || null,
      net: correct || wrong ? correct - wrong * 0.25 : null,
    },
  });
  return mapBlock(row);
}
