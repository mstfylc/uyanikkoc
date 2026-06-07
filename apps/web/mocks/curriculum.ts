import { DEFAULT_CURRICULUM_SUBJECTS, type CurriculumRecord } from "@uyanik/database";

const globalStore = globalThis as typeof globalThis & {
  __uyanikCurriculum?: Record<string, CurriculumRecord>;
};

const byCoach = globalStore.__uyanikCurriculum ?? (globalStore.__uyanikCurriculum = {});

const DEFAULT_SUBJECTS = DEFAULT_CURRICULUM_SUBJECTS;

function seedIfEmpty(coachId: string) {
  if (byCoach[coachId]) {
    return;
  }

  byCoach[coachId] = {
    coachId,
    examType: "TYT",
    subjects: structuredClone(DEFAULT_SUBJECTS),
  };
}

export function getCurriculum(coachId: string): CurriculumRecord {
  seedIfEmpty(coachId);
  return byCoach[coachId];
}

export function updateCurriculum(
  coachId: string,
  patch: Partial<Pick<CurriculumRecord, "examType" | "subjects">>,
): CurriculumRecord {
  const current = getCurriculum(coachId);
  byCoach[coachId] = { ...current, ...patch, coachId };
  return byCoach[coachId];
}

export function resetCurriculum(coachId: string): CurriculumRecord {
  const current = getCurriculum(coachId);
  byCoach[coachId] = {
    ...current,
    subjects: structuredClone(DEFAULT_SUBJECTS),
    coachId,
  };
  return byCoach[coachId];
}
