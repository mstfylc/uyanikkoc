import type { CoachRatingRecord, CoachRatingSummary, UpsertRatingInput } from "@uyanik/database";

import { DEMO_STUDENT_002_ID } from "@/mocks/roster";
import { DEMO_STUDENT_ID } from "@/mocks/assignments";
import { pushCoachNotification } from "@/mocks/notifications";
import { listCoachStudents } from "@/mocks/roster";

const globalStore = globalThis as typeof globalThis & {
  __uyanikRatings?: Map<string, CoachRatingRecord>;
  __uyanikRatingSeq?: number;
};

const byStudent = globalStore.__uyanikRatings ?? (globalStore.__uyanikRatings = new Map());
let seq = globalStore.__uyanikRatingSeq ?? (globalStore.__uyanikRatingSeq = 1);

function seedIfEmpty(coachId: string) {
  if (byStudent.size > 0) return;

  const timestamp = new Date().toISOString();
  byStudent.set(DEMO_STUDENT_002_ID, {
    id: `rt_${seq++}`,
    studentId: DEMO_STUDENT_002_ID,
    coachId,
    stars: 5,
    comment: "Hocam cok ilgili, her sorumu hemen yanitliyor. Netlerim ciddi yukseldi!",
    createdAt: timestamp,
  });
  byStudent.set(DEMO_STUDENT_ID, {
    id: `rt_${seq++}`,
    studentId: DEMO_STUDENT_ID,
    coachId,
    stars: 4,
    comment: "Program cok duzenli ama bazen randevu bulmakta zorlaniyorum.",
    createdAt: timestamp,
  });
}

export async function getForStudent(studentId: string): Promise<CoachRatingRecord | null> {
  return byStudent.get(studentId) ?? null;
}

export async function upsertRating(input: UpsertRatingInput): Promise<CoachRatingRecord> {
  const stars = Math.max(1, Math.min(5, Math.round(input.stars)));
  const existing = byStudent.get(input.studentId);
  const rec: CoachRatingRecord = {
    id: existing?.id ?? `rt_${seq++}`,
    studentId: input.studentId,
    coachId: input.coachId,
    stars,
    comment: input.comment ?? null,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  byStudent.set(input.studentId, rec);
  if (!existing) {
    const roster = listCoachStudents(input.coachId);
    const studentName =
      roster.find((entry) => entry.studentId === input.studentId)?.displayName ?? "Ogrenci";
    pushCoachNotification(
      input.coachId,
      "Yeni degerlendirme",
      `${studentName} koclugunu ${stars} yildizla puanladi`,
    );
  }
  return rec;
}

export async function getCoachSummary(coachId: string): Promise<CoachRatingSummary> {
  seedIfEmpty(coachId);
  const roster = listCoachStudents(coachId);
  const nameByStudent = new Map(roster.map((entry) => [entry.studentId, entry.displayName]));
  const ratings = [...byStudent.values()]
    .filter((r) => r.coachId === coachId)
    .map((rating) => ({
      ...rating,
      studentName: nameByStudent.get(rating.studentId) ?? "Ogrenci",
    }))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  const count = ratings.length;
  const average = count ? ratings.reduce((a, r) => a + r.stars, 0) / count : 0;
  return { average, count, ratings };
}
