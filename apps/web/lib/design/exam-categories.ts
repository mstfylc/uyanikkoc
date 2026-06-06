export const EXAM_CAT_ORDER = ["Türkçe", "Sosyal", "Matematik", "Fen"] as const;

export type ExamCategory = (typeof EXAM_CAT_ORDER)[number];

export const EXAM_CAT_COLOR: Record<ExamCategory, string> = {
  Türkçe: "#B26A12",
  Sosyal: "#A3582D",
  Matematik: "#534AB7",
  Fen: "#0F6E56",
};

export const EXAM_CAT_MAX: Record<ExamCategory, number> = {
  Türkçe: 40,
  Sosyal: 20,
  Matematik: 40,
  Fen: 20,
};

const SUBJECT_TO_CAT: Record<string, ExamCategory> = {
  turkce: "Türkçe",
  türkçe: "Türkçe",
  sosyal: "Sosyal",
  tarih: "Sosyal",
  cografya: "Sosyal",
  coğrafya: "Sosyal",
  felsefe: "Sosyal",
  "din kulturu": "Sosyal",
  matematik: "Matematik",
  fen: "Fen",
  fizik: "Fen",
  kimya: "Fen",
  biyoloji: "Fen",
};

export function subjectToExamCategory(subjectName: string): ExamCategory | null {
  const key = subjectName.trim().toLocaleLowerCase("tr-TR");
  return SUBJECT_TO_CAT[key] ?? null;
}

export function estimateTytScore(totalNet: number): number {
  return Math.round(totalNet * 4.3 + 100);
}
