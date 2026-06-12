import { shouldUseDatabase } from "@/lib/data/env";

const ERROR_TYPES = ["bilgi", "islem", "sure", "dikkat", "yorum", "unutma"] as const;
const QUESTION_TYPES = ["yeninesil", "klasik", "islem", "yorum", "grafik"] as const;
const SOURCE_TYPES = ["assignment_result", "exam_result", "optik_submission", "manual"] as const;

export type StudentMistakeInput = {
  subject?: string;
  topic?: string | null;
  subtopic?: string;
  errorType?: (typeof ERROR_TYPES)[number];
  source?: string;
  qType?: (typeof QUESTION_TYPES)[number];
  note?: string;
  photoUrl?: string | null;
  sourceKind?: (typeof SOURCE_TYPES)[number] | null;
  sourceRefId?: string | null;
  sourceLabel?: string | null;
};

export type StudentMistakePatch = Partial<
  Pick<StudentMistakeInput, "subject" | "topic" | "subtopic" | "errorType" | "source" | "qType" | "note" | "photoUrl">
>;

function cleanText(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function cleanUrl(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) {
    throw new Error("Photo must be stored as a URL");
  }
  return trimmed;
}

function normalizeInput(input: StudentMistakeInput) {
  const subject = cleanText(input.subject);
  if (!subject) {
    throw new Error("Subject is required");
  }

  const errorType = ERROR_TYPES.includes(input.errorType ?? "islem") ? input.errorType ?? "islem" : "islem";
  const qType = QUESTION_TYPES.includes(input.qType ?? "klasik") ? input.qType ?? "klasik" : "klasik";

  const sourceKind = SOURCE_TYPES.includes(input.sourceKind ?? "manual") ? input.sourceKind ?? "manual" : "manual";

  return {
    subject,
    topic: cleanText(input.topic) ?? null,
    subtopic: cleanText(input.subtopic) ?? "",
    errorType,
    source: cleanText(input.source) ?? "",
    qType,
    note: cleanText(input.note) ?? "",
    photoUrl: cleanUrl(input.photoUrl) ?? null,
    sourceKind,
    sourceRefId: cleanText(input.sourceRefId) ?? null,
    sourceLabel: cleanText(input.sourceLabel) ?? null,
  };
}

function normalizePatch(patch: StudentMistakePatch) {
  const data: StudentMistakePatch = {};
  if ("subject" in patch) data.subject = cleanText(patch.subject);
  if ("topic" in patch) data.topic = cleanText(patch.topic);
  if ("subtopic" in patch) data.subtopic = cleanText(patch.subtopic) ?? "";
  if ("source" in patch) data.source = cleanText(patch.source) ?? "";
  if ("note" in patch) data.note = cleanText(patch.note) ?? "";
  if ("photoUrl" in patch) data.photoUrl = cleanUrl(patch.photoUrl) ?? null;
  if ("errorType" in patch && ERROR_TYPES.includes(patch.errorType ?? "islem")) data.errorType = patch.errorType;
  if ("qType" in patch && QUESTION_TYPES.includes(patch.qType ?? "klasik")) data.qType = patch.qType;
  return data;
}

async function getRepository() {
  if (!shouldUseDatabase()) {
    throw new Error("Database is required for Yanlis Defteri");
  }
  const { mistakeRepository } = await import("@uyanik/database");
  return mistakeRepository;
}

async function getMemoryStore() {
  const memory = await import("@/mocks/mistakes");
  return memory;
}

export async function listStudentMistakes(studentId: string) {
  if (!shouldUseDatabase()) {
    return (await getMemoryStore()).listForStudent(studentId);
  }
  const repository = await getRepository();
  return repository.listForStudent(studentId);
}

export async function createStudentMistake(studentId: string, input: StudentMistakeInput) {
  if (!shouldUseDatabase()) {
    return (await getMemoryStore()).createForStudent(studentId, normalizeInput(input));
  }
  const repository = await getRepository();
  return repository.createForStudent(studentId, normalizeInput(input));
}

export async function createStudentMistakeBatch(studentId: string, items: StudentMistakeInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("items are required");
  }
  if (!shouldUseDatabase()) {
    return (await getMemoryStore()).createBatchForStudent(studentId, items.slice(0, 50).map(normalizeInput));
  }
  const repository = await getRepository();
  return repository.createBatchForStudent(studentId, items.slice(0, 50).map(normalizeInput));
}

export async function createStudentMistakeBatchIdempotent(studentId: string, items: StudentMistakeInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    return { created: [], skipped: 0 };
  }
  const normalized = items.slice(0, 50).map(normalizeInput);
  if (!shouldUseDatabase()) {
    return (await getMemoryStore()).createBatchForStudentIdempotent(studentId, normalized);
  }
  const repository = await getRepository();
  return repository.createBatchForStudentIdempotent(studentId, normalized);
}

export async function updateStudentMistake(mistakeId: string, studentId: string, patch: StudentMistakePatch) {
  if (!shouldUseDatabase()) {
    return (await getMemoryStore()).updateForStudent(mistakeId, studentId, normalizePatch(patch));
  }
  const repository = await getRepository();
  return repository.updateForStudent(mistakeId, studentId, normalizePatch(patch));
}

export async function deleteStudentMistake(mistakeId: string, studentId: string) {
  if (!shouldUseDatabase()) {
    return (await getMemoryStore()).deleteForStudent(mistakeId, studentId);
  }
  const repository = await getRepository();
  return repository.deleteForStudent(mistakeId, studentId);
}

export async function reviewStudentMistake(mistakeId: string, studentId: string) {
  if (!shouldUseDatabase()) {
    return (await getMemoryStore()).reviewForStudent(mistakeId, studentId);
  }
  const repository = await getRepository();
  return repository.reviewForStudent(mistakeId, studentId);
}

export async function ingestOptikSubmissionMistakes(input: {
  studentId: string;
  examId: string;
  examType: "TYT" | "AYT" | "LGS";
  examTitle: string;
  answers: string[];
  answerKey: string[];
}) {
  const items = input.answerKey.flatMap((correctAnswer, index) => {
    const answer = input.answers[index] ?? "";
    if (answer && answer === correctAnswer) {
      return [];
    }
    return [{
      subject: input.examType,
      topic: null,
      errorType: answer ? "islem" as const : "unutma" as const,
      qType: "klasik" as const,
      source: input.examTitle,
      sourceKind: "optik_submission" as const,
      sourceRefId: `optik:${input.examId}`,
      sourceLabel: `Soru ${index + 1}`,
      note: answer ? `Cevap: ${answer}; dogru: ${correctAnswer}` : `Bos cevap; dogru: ${correctAnswer}`,
    }];
  });

  return createStudentMistakeBatchIdempotent(input.studentId, items);
}
