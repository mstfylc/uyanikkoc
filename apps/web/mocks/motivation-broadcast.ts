import type { MotivationMessageRecord } from "@uyanik/database";

import { pushStudentNotification } from "@/mocks/notifications";

const globalStore = globalThis as typeof globalThis & {
  __uyanikMotivationMessages?: MotivationMessageRecord[];
  __uyanikMotivationSeq?: number;
};

const messages = globalStore.__uyanikMotivationMessages ?? (globalStore.__uyanikMotivationMessages = []);
let seq = globalStore.__uyanikMotivationSeq ?? (globalStore.__uyanikMotivationSeq = 1);

function seedIfEmpty(): void {
  if (messages.length > 0) {
    return;
  }

  const timestamp = new Date(Date.now() - 2 * 60 * 60_000).toISOString();
  messages.push(
    {
      id: `mm_${seq++}`,
      studentId: "student_001",
      coachId: "coach_001",
      body: "Bugün hedefimiz net: önce paragraf, sonra türev. Küçük ama tam odaklı iki blok yeter.",
      createdAt: timestamp,
    },
    {
      id: `mm_${seq++}`,
      studentId: "student_002",
      coachId: "coach_001",
      body: "Geometri tekrarını kısa tutup yanlış defterine dön. İyi gidiyorsun.",
      createdAt: timestamp,
    },
  );
  globalStore.__uyanikMotivationSeq = seq;
}

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
    pushStudentNotification(studentId, "Koçundan motivasyon", body);
  }
  return studentIds.length;
}

export async function latestForStudent(studentId: string): Promise<MotivationMessageRecord | null> {
  seedIfEmpty();
  return messages.find((item) => item.studentId === studentId) ?? null;
}
