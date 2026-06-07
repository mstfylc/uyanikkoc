import type { CurriculumRecord } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryCurriculum from "@/mocks/curriculum";

async function repo() {
  const { curriculumRepository } = await import("@uyanik/database");
  return curriculumRepository;
}

export async function getCoachCurriculum(coachId: string): Promise<CurriculumRecord> {
  if (shouldUseDatabase()) return (await repo()).getCurriculum(coachId);
  return memoryCurriculum.getCurriculum(coachId);
}

export async function updateCoachCurriculum(
  coachId: string,
  patch: Partial<Pick<CurriculumRecord, "examType" | "subjects">> & { reset?: boolean },
): Promise<CurriculumRecord> {
  const source = shouldUseDatabase() ? await repo() : memoryCurriculum;
  if (patch.reset) {
    return source.resetCurriculum(coachId);
  }
  const { reset: _reset, ...rest } = patch;
  return source.updateCurriculum(coachId, rest);
}
