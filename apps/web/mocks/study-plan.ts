import { DEMO_STUDENT_ID } from "@/mocks/assignments";
import { SCHOOL_DAYS } from "@/mocks/schedule";

export type StudyBlockRecord = {
  id: string;
  day: string;
  time: string;
  subject: string;
  topic: string;
  type: string;
  done: boolean;
};

const globalStore = globalThis as typeof globalThis & {
  __uyanikStudyPlans?: Record<string, StudyBlockRecord[]>;
};

const plans = globalStore.__uyanikStudyPlans ?? (globalStore.__uyanikStudyPlans = {});

function seedIfEmpty(studentId: string) {
  if (plans[studentId]) {
    return;
  }

  if (studentId !== DEMO_STUDENT_ID) {
    plans[studentId] = [];
    return;
  }

  plans[studentId] = [
    { id: "sb_1", day: "Pzt", time: "16:30", subject: "Matematik", topic: "Turev", type: "Soru", done: false },
    { id: "sb_2", day: "Pzt", time: "18:00", subject: "Fizik", topic: "Hareket", type: "Video", done: true },
    { id: "sb_3", day: "Sal", time: "17:00", subject: "Turkce", topic: "Paragraf", type: "Soru", done: false },
    { id: "sb_4", day: "Sal", time: "19:30", subject: "Kimya", topic: "Asit-Baz", type: "Konu", done: false },
    { id: "sb_5", day: "Car", time: "16:00", subject: "Matematik", topic: "Integral", type: "Soru", done: false },
    { id: "sb_6", day: "Per", time: "18:30", subject: "Biyoloji", topic: "Hucre", type: "Soru", done: true },
    { id: "sb_7", day: "Cum", time: "15:30", subject: "Matematik", topic: "Deneme", type: "Deneme", done: false },
  ];
}

export function getStudyPlan(studentId: string): StudyBlockRecord[] {
  seedIfEmpty(studentId);
  return plans[studentId];
}

export function toggleStudyBlock(studentId: string, blockId: string): StudyBlockRecord | null {
  seedIfEmpty(studentId);
  const index = plans[studentId].findIndex((block) => block.id === blockId);
  if (index < 0) {
    return null;
  }
  plans[studentId][index] = { ...plans[studentId][index], done: !plans[studentId][index].done };
  return plans[studentId][index];
}

export function addStudyBlock(
  studentId: string,
  input: { day: string; time: string; subject: string; topic: string; type: string },
): StudyBlockRecord {
  seedIfEmpty(studentId);
  const block: StudyBlockRecord = {
    id: `sb_${Date.now()}`,
    day: input.day,
    time: input.time,
    subject: input.subject.trim(),
    topic: input.topic.trim(),
    type: input.type.trim() || "Soru",
    done: false,
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
    const done = dayBlocks.filter((block) => block.done).length;
    return { label: day, value: Math.round((done / dayBlocks.length) * 100) };
  });
}

export const STUDY_DAYS = [...SCHOOL_DAYS, "Cmt", "Paz"];

export function countWeeklyBlocks(blocks: StudyBlockRecord[]): number {
  return blocks.length;
}

export function countWeeklyDone(blocks: StudyBlockRecord[]): number {
  return blocks.filter((block) => block.done).length;
}
