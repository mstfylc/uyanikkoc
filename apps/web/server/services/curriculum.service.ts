import type { CurriculumRecord } from "@uyanik/database";

import * as memoryCurriculum from "@/mocks/curriculum";

export async function getCoachCurriculum(coachId: string): Promise<CurriculumRecord> {
  return memoryCurriculum.getCurriculum(coachId);
}

export async function updateCoachCurriculum(
  coachId: string,
  patch: Partial<Pick<CurriculumRecord, "examType" | "subjects">>,
): Promise<CurriculumRecord> {
  return memoryCurriculum.updateCurriculum(coachId, patch);
}
