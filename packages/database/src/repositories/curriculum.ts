import { prisma } from "../client";
import type { CurriculumRecord, CurriculumTopicGroup } from "../types";

/** Yeni koç için başlangıç müfredat şablonu (bellek ve DB modu ortak kaynağı). */
export const DEFAULT_CURRICULUM_SUBJECTS: Record<string, CurriculumTopicGroup[]> = {
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

function defaultRecord(coachId: string): CurriculumRecord {
  return { coachId, examType: "TYT", subjects: structuredClone(DEFAULT_CURRICULUM_SUBJECTS) };
}

export async function getCurriculum(coachId: string): Promise<CurriculumRecord> {
  const row = await prisma.coachCurriculum.findUnique({ where: { coachId } });
  if (!row) return defaultRecord(coachId);
  return {
    coachId,
    examType: row.examType,
    subjects: row.subjects as Record<string, CurriculumTopicGroup[]>,
  };
}

export async function updateCurriculum(
  coachId: string,
  patch: Partial<Pick<CurriculumRecord, "examType" | "subjects">>,
): Promise<CurriculumRecord> {
  const current = await getCurriculum(coachId);
  const next = {
    examType: patch.examType ?? current.examType,
    subjects: patch.subjects ?? current.subjects,
  };
  await prisma.coachCurriculum.upsert({
    where: { coachId },
    create: { coachId, examType: next.examType, subjects: next.subjects },
    update: { examType: next.examType, subjects: next.subjects },
  });
  return { coachId, ...next };
}

export async function resetCurriculum(coachId: string): Promise<CurriculumRecord> {
  return updateCurriculum(coachId, { subjects: structuredClone(DEFAULT_CURRICULUM_SUBJECTS) });
}
