import { DEMO_STUDENT_ID } from "@/mocks/assignments";

const MIS_INTERVALS = [1, 3, 7, 21] as const;

type MistakeInput = {
  subject: string;
  topic?: string | null;
  subtopic?: string;
  errorType?: "bilgi" | "islem" | "sure" | "dikkat" | "yorum" | "unutma";
  source?: string;
  qType?: "yeninesil" | "klasik" | "islem" | "yorum" | "grafik";
  note?: string;
  photoUrl?: string | null;
  sourceKind?: "assignment_result" | "exam_result" | "optik_submission" | "manual" | null;
  sourceRefId?: string | null;
  sourceLabel?: string | null;
};

type MistakePatchInput = Partial<
  Pick<MistakeInput, "subject" | "topic" | "subtopic" | "errorType" | "source" | "qType" | "note" | "photoUrl">
>;

type MistakeRecord = {
  id: string;
  studentId: string;
  subject: string;
  topic: string | null;
  subtopic: string;
  errorType: NonNullable<MistakeInput["errorType"]>;
  source: string;
  qType: NonNullable<MistakeInput["qType"]>;
  note: string;
  photoUrl: string | null;
  status: "acik" | "tekrar" | "kapandi";
  stage: number;
  nextDue: string | null;
  sourceKind: NonNullable<MistakeInput["sourceKind"]>;
  sourceRefId: string | null;
  sourceLabel: string | null;
  createdAt: string;
  updatedAt: string;
  history: Array<{ ymd: string; at: number; stage: number }>;
};

const globalStore = globalThis as typeof globalThis & {
  __uyanikMistakes?: MistakeRecord[];
  __uyanikMistakeSeq?: number;
};

const mistakes = globalStore.__uyanikMistakes ?? (globalStore.__uyanikMistakes = []);
let seq = globalStore.__uyanikMistakeSeq ?? (globalStore.__uyanikMistakeSeq = 1);

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function seedDemoMistakes() {
  if (mistakes.some((item) => item.studentId === DEMO_STUDENT_ID)) {
    return;
  }

  const timestamp = nowIso();
  const seeds: Array<Pick<MistakeRecord, "subject" | "topic" | "subtopic" | "errorType" | "source" | "qType" | "note" | "stage" | "nextDue">> = [
    {
      subject: "Matematik",
      topic: "Problemler",
      subtopic: "Yaş problemi",
      errorType: "islem",
      source: "3D TYT Matematik Soru Bankası",
      qType: "klasik",
      note: "Oran kurarken bilinmeyeni yanlış yere aldım.",
      stage: 0,
      nextDue: addDays(0),
    },
    {
      subject: "Matematik",
      topic: "Türev",
      subtopic: "Maksimum-minimum",
      errorType: "bilgi",
      source: "Orijinal AYT Matematik",
      qType: "grafik",
      note: "Kritik nokta yorumunu tekrar et.",
      stage: 1,
      nextDue: addDays(1),
    },
    {
      subject: "Türkçe",
      topic: "Paragraf",
      subtopic: "Ana düşünce",
      errorType: "sure",
      source: "Hız ve Renk Paragraf",
      qType: "yorum",
      note: "Şıkları acele elemişim.",
      stage: 2,
      nextDue: addDays(3),
    },
    {
      subject: "Fizik",
      topic: "Kuvvet ve Newton",
      subtopic: "Sürtünme",
      errorType: "dikkat",
      source: "345 TYT Fizik",
      qType: "islem",
      note: "Birim dönüşümünü kontrol et.",
      stage: 0,
      nextDue: addDays(0),
    },
  ];

  for (const seed of seeds) {
    mistakes.push({
      id: `mistake_seed_${seq++}`,
      studentId: DEMO_STUDENT_ID,
      subject: seed.subject,
      topic: seed.topic,
      subtopic: seed.subtopic,
      errorType: seed.errorType,
      source: seed.source,
      qType: seed.qType,
      note: seed.note,
      photoUrl: null,
      status: seed.stage > 0 ? "tekrar" : "acik",
      stage: seed.stage,
      nextDue: seed.nextDue,
      sourceKind: "manual",
      sourceRefId: null,
      sourceLabel: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [],
    });
  }
  globalStore.__uyanikMistakeSeq = seq;
}

export function listForStudent(studentId: string): MistakeRecord[] {
  seedDemoMistakes();
  return mistakes.filter((item) => item.studentId === studentId);
}

export function createForStudent(studentId: string, input: MistakeInput): MistakeRecord {
  const timestamp = nowIso();
  const record: MistakeRecord = {
    id: `mistake_${seq++}`,
    studentId,
    subject: input.subject,
    topic: input.topic ?? null,
    subtopic: input.subtopic ?? "",
    errorType: input.errorType ?? "islem",
    source: input.source ?? "",
    qType: input.qType ?? "klasik",
    note: input.note ?? "",
    photoUrl: input.photoUrl ?? null,
    status: "acik",
    stage: 0,
    nextDue: addDays(MIS_INTERVALS[0]),
    sourceKind: input.sourceKind ?? "manual",
    sourceRefId: input.sourceRefId ?? null,
    sourceLabel: input.sourceLabel ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
    history: [],
  };
  mistakes.push(record);
  globalStore.__uyanikMistakeSeq = seq;
  return record;
}

export function createBatchForStudent(studentId: string, items: MistakeInput[]): MistakeRecord[] {
  return items.map((item) => createForStudent(studentId, item));
}

export function createBatchForStudentIdempotent(
  studentId: string,
  items: MistakeInput[],
): { created: MistakeRecord[]; skipped: number } {
  const created: MistakeRecord[] = [];
  let skipped = 0;
  for (const item of items) {
    const duplicate = item.sourceRefId
      ? mistakes.some((existing) =>
          existing.studentId === studentId &&
          existing.sourceKind === (item.sourceKind ?? "manual") &&
          existing.sourceRefId === item.sourceRefId &&
          existing.sourceLabel === (item.sourceLabel ?? null) &&
          existing.subject === item.subject &&
          existing.topic === (item.topic ?? null) &&
          existing.errorType === (item.errorType ?? "islem"))
      : false;
    if (duplicate) {
      skipped += 1;
    } else {
      created.push(createForStudent(studentId, item));
    }
  }
  return { created, skipped };
}

export function updateForStudent(mistakeId: string, studentId: string, patch: MistakePatchInput): MistakeRecord | null {
  const record = mistakes.find((item) => item.id === mistakeId && item.studentId === studentId);
  if (!record) return null;
  Object.assign(record, patch, { updatedAt: nowIso() });
  return record;
}

export function deleteForStudent(mistakeId: string, studentId: string): boolean {
  const index = mistakes.findIndex((item) => item.id === mistakeId && item.studentId === studentId);
  if (index < 0) return false;
  mistakes.splice(index, 1);
  return true;
}

export function reviewForStudent(mistakeId: string, studentId: string): MistakeRecord | null {
  const record = mistakes.find((item) => item.id === mistakeId && item.studentId === studentId);
  if (!record) return null;
  if (record.status === "kapandi") return record;
  const nextStage = Math.min(record.stage + 1, MIS_INTERVALS.length);
  record.stage = nextStage;
  record.status = nextStage >= MIS_INTERVALS.length ? "kapandi" : "tekrar";
  record.nextDue = nextStage >= MIS_INTERVALS.length ? null : addDays(MIS_INTERVALS[nextStage]);
  record.updatedAt = nowIso();
  record.history.push({ ymd: new Date().toISOString().slice(0, 10), at: Date.now(), stage: nextStage });
  return record;
}
