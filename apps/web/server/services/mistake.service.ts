import { shouldUseDatabase } from "@/lib/data/env";

const ERROR_TYPES = ["bilgi", "islem", "sure", "dikkat", "yorum", "unutma"] as const;
const QUESTION_TYPES = ["yeninesil", "klasik", "islem", "yorum", "grafik"] as const;

export type StudentMistakeInput = {
  subject?: string;
  topic?: string;
  subtopic?: string;
  errorType?: (typeof ERROR_TYPES)[number];
  source?: string;
  qType?: (typeof QUESTION_TYPES)[number];
  note?: string;
  photoUrl?: string | null;
  sourceKind?: string | null;
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
  const topic = cleanText(input.topic);
  if (!subject || !topic) {
    throw new Error("Subject and topic are required");
  }

  const errorType = ERROR_TYPES.includes(input.errorType ?? "islem") ? input.errorType ?? "islem" : "islem";
  const qType = QUESTION_TYPES.includes(input.qType ?? "klasik") ? input.qType ?? "klasik" : "klasik";

  return {
    subject,
    topic,
    subtopic: cleanText(input.subtopic) ?? "",
    errorType,
    source: cleanText(input.source) ?? "",
    qType,
    note: cleanText(input.note) ?? "",
    photoUrl: cleanUrl(input.photoUrl) ?? null,
    sourceKind: cleanText(input.sourceKind) ?? null,
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

export async function listStudentMistakes(studentId: string) {
  const repository = await getRepository();
  return repository.listForStudent(studentId);
}

export async function createStudentMistake(studentId: string, input: StudentMistakeInput) {
  const repository = await getRepository();
  return repository.createForStudent(studentId, normalizeInput(input));
}

export async function createStudentMistakeBatch(studentId: string, items: StudentMistakeInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("items are required");
  }
  const repository = await getRepository();
  return repository.createBatchForStudent(studentId, items.slice(0, 50).map(normalizeInput));
}

export async function updateStudentMistake(mistakeId: string, studentId: string, patch: StudentMistakePatch) {
  const repository = await getRepository();
  return repository.updateForStudent(mistakeId, studentId, normalizePatch(patch));
}

export async function deleteStudentMistake(mistakeId: string, studentId: string) {
  const repository = await getRepository();
  return repository.deleteForStudent(mistakeId, studentId);
}

export async function reviewStudentMistake(mistakeId: string, studentId: string) {
  const repository = await getRepository();
  return repository.reviewForStudent(mistakeId, studentId);
}
