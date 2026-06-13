import type { StudyBlockRecord, StudyBlockStatus } from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";

export type { StudyBlockRecord, StudyBlockStatus } from "@uyanik/database";

const globalStore = globalThis as typeof globalThis & {
  __uyanikStudyPlans?: Record<string, StudyBlockRecord[]>;
};

const plans = globalStore.__uyanikStudyPlans ?? (globalStore.__uyanikStudyPlans = {});

function normalizeBlock(block: StudyBlockRecord & { done?: boolean }): StudyBlockRecord {
  if (block.status) return block;
  return { ...block, status: block.done ? "done" : "todo" };
}

function seedIfEmpty(studentId: string) {
  if (plans[studentId]) {
    plans[studentId] = plans[studentId].map((b) => normalizeBlock(b as StudyBlockRecord & { done?: boolean }));
    return;
  }

  if (studentId !== DEMO_STUDENT_ID) {
    plans[studentId] = [];
    return;
  }

  plans[studentId] = [
    { id: "sb_1", day: "Pzt", time: "16:30", subject: "Matematik", topic: "Türev", type: "Soru", status: "todo" },
    { id: "sb_2", day: "Pzt", time: "18:00", subject: "Fizik", topic: "Hareket", type: "Video", status: "done" },
    { id: "sb_3", day: "Sal", time: "17:00", subject: "Türkçe", topic: "Paragraf", type: "Soru", status: "progress" },
    { id: "sb_4", day: "Sal", time: "19:30", subject: "Kimya", topic: "Asit-Baz", type: "Konu", status: "todo" },
    { id: "sb_5", day: "Car", time: "16:00", subject: "Matematik", topic: "Integral", type: "Soru", status: "todo" },
    { id: "sb_6", day: "Per", time: "18:30", subject: "Biyoloji", topic: "Hucre", type: "Soru", status: "done" },
    { id: "sb_7", day: "Cum", time: "15:30", subject: "Matematik", topic: "Deneme", type: "Deneme", status: "todo" },
  ];
}

export function getStudyPlan(studentId: string): StudyBlockRecord[] {
  seedIfEmpty(studentId);
  return plans[studentId];
}

export function advanceStudyBlock(
  studentId: string,
  blockId: string,
  action: "start" | "finish" | "reset",
): StudyBlockRecord | null {
  seedIfEmpty(studentId);
  const index = plans[studentId].findIndex((block) => block.id === blockId);
  if (index < 0) return null;

  const current = plans[studentId][index];
  let status: StudyBlockStatus = current.status;
  if (action === "start") status = "progress";
  if (action === "finish") status = "done";
  if (action === "reset") status = "todo";

  plans[studentId][index] = { ...current, status };
  return plans[studentId][index];
}

/** @deprecated use advanceStudyBlock */
export function toggleStudyBlock(studentId: string, blockId: string): StudyBlockRecord | null {
  seedIfEmpty(studentId);
  const block = plans[studentId].find((b) => b.id === blockId);
  if (!block) return null;
  if (block.status === "todo") return advanceStudyBlock(studentId, blockId, "start");
  if (block.status === "progress") return advanceStudyBlock(studentId, blockId, "finish");
  return advanceStudyBlock(studentId, blockId, "reset");
}

export function addStudyBlock(
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
): StudyBlockRecord {
  seedIfEmpty(studentId);
  const correct = input.correct ?? 0;
  const wrong = input.wrong ?? 0;
  const block: StudyBlockRecord = {
    id: `sb_${Date.now()}`,
    day: input.day,
    time: input.time,
    subject: input.subject.trim(),
    topic: input.topic.trim(),
    type: input.type.trim() || "Soru",
    status: "todo",
    source: input.source?.trim() || undefined,
    correct: correct || undefined,
    wrong: wrong || undefined,
    net: correct || wrong ? correct - wrong * 0.25 : undefined,
  };
  plans[studentId].push(block);
  return block;
}

export function weeklyCompletionByDay(blocks: StudyBlockRecord[]): Array<{ label: string; value: number }> {
  return STUDY_DAYS.map((day) => {
    const dayBlocks = blocks.filter((block) => block.day === day);
    if (dayBlocks.length === 0) {
      return { label: day, value: 0 };
    }
    const done = dayBlocks.filter((block) => block.status === "done").length;
    return { label: day, value: Math.round((done / dayBlocks.length) * 100) };
  });
}

export const STUDY_DAYS = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];

export function countWeeklyBlocks(blocks: StudyBlockRecord[]): number {
  return blocks.length;
}

export function countWeeklyDone(blocks: StudyBlockRecord[]): number {
  return blocks.filter((block) => block.status === "done").length;
}
