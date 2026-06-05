import type { CurriculumRecord, CurriculumTopicGroup } from "@uyanik/database";

const globalStore = globalThis as typeof globalThis & {
  __uyanikCurriculum?: Record<string, CurriculumRecord>;
};

const byCoach = globalStore.__uyanikCurriculum ?? (globalStore.__uyanikCurriculum = {});

const DEFAULT_SUBJECTS: Record<string, CurriculumTopicGroup[]> = {
  Turkce: [
    { name: "Sozcukte Anlam", topics: ["Sozcukte Anlam", "Deyimler"] },
    { name: "Paragraf", topics: ["Ana Fikir", "Yardimci Dusunce"] },
  ],
  Matematik: [
    { name: "Temel Kavramlar", topics: ["Temel Kavramlar", "Bolunebilme"] },
    { name: "Turev", topics: ["Turev Alma", "Turev Uygulamalari"] },
  ],
  Fizik: [{ name: "Mekanik", topics: ["Hareket", "Kuvvet"] }],
};

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
