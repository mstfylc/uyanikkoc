import type { CurriculumRecord } from "@uyanik/database";

import * as memoryCurriculum from "@/mocks/curriculum";

export async function getCoachCurriculum(coachId: string): Promise<CurriculumRecord> {
  return memoryCurriculum.getCurriculum(coachId);
}

export async function updateCoachCurriculum(
  coachId: string,
  patch: Partial<Pick<CurriculumRecord, "examType" | "subjects">> & { reset?: boolean },
): Promise<CurriculumRecord> {
  if (patch.reset) {
    return memoryCurriculum.resetCurriculum(coachId);
  }
  const { reset: _reset, ...rest } = patch;
  return memoryCurriculum.updateCurriculum(coachId, rest);
}
