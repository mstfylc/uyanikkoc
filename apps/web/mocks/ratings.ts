import type { CoachRatingRecord, CoachRatingSummary, UpsertRatingInput } from "@uyanik/database";

const globalStore = globalThis as typeof globalThis & {
  __uyanikRatings?: Map<string, CoachRatingRecord>;
  __uyanikRatingSeq?: number;
};

const byStudent = globalStore.__uyanikRatings ?? (globalStore.__uyanikRatings = new Map());
let seq = globalStore.__uyanikRatingSeq ?? (globalStore.__uyanikRatingSeq = 1);

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
  return rec;
}

export async function getCoachSummary(coachId: string): Promise<CoachRatingSummary> {
  const ratings = [...byStudent.values()].filter((r) => r.coachId === coachId);
  const count = ratings.length;
  const average = count ? ratings.reduce((a, r) => a + r.stars, 0) / count : 0;
  return { average, count, ratings };
}
