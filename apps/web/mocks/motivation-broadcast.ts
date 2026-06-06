import type { MotivationMessageRecord } from "@uyanik/database";

import { pushStudentNotification } from "@/mocks/notifications";

const globalStore = globalThis as typeof globalThis & {
  __uyanikMotivationMessages?: MotivationMessageRecord[];
  __uyanikMotivationSeq?: number;
};

const messages = globalStore.__uyanikMotivationMessages ?? (globalStore.__uyanikMotivationMessages = []);
let seq = globalStore.__uyanikMotivationSeq ?? (globalStore.__uyanikMotivationSeq = 1);

export async function sendToStudents(
  coachId: string,
  studentIds: string[],
  body: string,
): Promise<number> {
  const timestamp = new Date().toISOString();
  for (const studentId of studentIds) {
    messages.unshift({
      id: `mm_${seq++}`,
      studentId,
      coachId,
      body,
      createdAt: timestamp,
    });
    pushStudentNotification(studentId, "Kocundan motivasyon", body);
  }
  return studentIds.length;
}

export async function latestForStudent(studentId: string): Promise<MotivationMessageRecord | null> {
  return messages.find((item) => item.studentId === studentId) ?? null;
}
