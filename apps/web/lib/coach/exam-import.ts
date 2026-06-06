import type { CreateExamResultInput, ResultExamType } from "@uyanik/database";

const EXAM_TYPES: ResultExamType[] = ["TYT", "AYT", "LGS"];

export function parseCsvExamImport(text: string): CreateExamResultInput[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const grouped = new Map<
    string,
    {
      studentId: string;
      examType: ResultExamType;
      label: string | null;
      takenAt: string;
      subjects: Array<{ subjectName: string; correct: number; wrong: number }>;
    }
  >();

  for (const line of lines) {
    const parts = line.split(",").map((part) => part.trim());
    if (parts.length < 7) {
      continue;
    }

    const [studentId, examTypeRaw, label, takenAtRaw, subject, correctRaw, wrongRaw] = parts;
    if (!studentId || !EXAM_TYPES.includes(examTypeRaw as ResultExamType)) {
      continue;
    }

    const examType = examTypeRaw as ResultExamType;
    const key = `${studentId}|${examType}|${label}|${takenAtRaw}`;
    const entry = grouped.get(key) ?? {
      studentId,
      examType,
      label: label || null,
      takenAt: new Date(takenAtRaw).toISOString(),
      subjects: [],
    };

    entry.subjects.push({
      subjectName: subject,
      correct: Number(correctRaw),
      wrong: Number(wrongRaw),
    });
    grouped.set(key, entry);
  }

  return Array.from(grouped.values()).filter((item) => item.subjects.length > 0);
}
