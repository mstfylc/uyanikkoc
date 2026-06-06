import type { CoachRatingRecord, CoachRatingSummary, UpsertRatingInput } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryRatings from "@/mocks/ratings";

async function repo() {
  const { ratingRepository } = await import("@uyanik/database");
  return ratingRepository;
}

export async function getStudentRating(studentId: string): Promise<CoachRatingRecord | null> {
  if (shouldUseDatabase()) return (await repo()).getForStudent(studentId);
  return memoryRatings.getForStudent(studentId);
}

export async function submitRating(input: UpsertRatingInput): Promise<CoachRatingRecord> {
  if (shouldUseDatabase()) return (await repo()).upsertRating(input);
  return memoryRatings.upsertRating(input);
}

export async function getCoachRatingSummary(coachId: string): Promise<CoachRatingSummary> {
  if (shouldUseDatabase()) return (await repo()).getCoachSummary(coachId);
  return memoryRatings.getCoachSummary(coachId);
}
