import { prisma } from "../client";
import type { CoachRatingRecord, CoachRatingSummary, UpsertRatingInput } from "../types";

function map(r: {
  id: string; studentId: string; coachId: string; stars: number; comment: string | null; createdAt: Date;
}): CoachRatingRecord {
  return {
    id: r.id, studentId: r.studentId, coachId: r.coachId, stars: r.stars,
    comment: r.comment, createdAt: r.createdAt.toISOString(),
  };
}

export async function getForStudent(studentId: string): Promise<CoachRatingRecord | null> {
  const r = await prisma.coachRating.findUnique({ where: { studentId } });
  return r ? map(r) : null;
}

export async function upsertRating(input: UpsertRatingInput): Promise<CoachRatingRecord> {
  const stars = Math.max(1, Math.min(5, Math.round(input.stars)));
  const r = await prisma.coachRating.upsert({
    where: { studentId: input.studentId },
    update: { stars, comment: input.comment ?? null, coachId: input.coachId },
    create: { studentId: input.studentId, coachId: input.coachId, stars, comment: input.comment ?? null },
  });
  return map(r);
}

export async function getCoachSummary(coachId: string): Promise<CoachRatingSummary> {
  const rows = await prisma.coachRating.findMany({ where: { coachId }, orderBy: { createdAt: "desc" } });
  const ratings = rows.map(map);
  const count = ratings.length;
  const average = count ? ratings.reduce((a, r) => a + r.stars, 0) / count : 0;
  return { average, count, ratings };
}
