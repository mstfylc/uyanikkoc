import { prisma } from "../client";

export const MIS_INTERVALS = [1, 3, 7, 21] as const;

export type MistakeErrorType = "bilgi" | "islem" | "sure" | "dikkat" | "yorum" | "unutma";
export type MistakeQuestionType = "yeninesil" | "klasik" | "islem" | "yorum" | "grafik";
export type MistakeStatus = "acik" | "tekrar" | "kapandi";

export type MistakeInput = {
  subject: string;
  topic: string;
  subtopic?: string;
  errorType?: MistakeErrorType;
  source?: string;
  qType?: MistakeQuestionType;
  note?: string;
  photoUrl?: string | null;
  sourceKind?: string | null;
  sourceRefId?: string | null;
  sourceLabel?: string | null;
};

export type MistakePatchInput = Partial<
  Pick<MistakeInput, "subject" | "topic" | "subtopic" | "errorType" | "source" | "qType" | "note" | "photoUrl">
>;

export type MistakeRecord = {
  id: string;
  studentId: string;
  subject: string;
  topic: string;
  subtopic: string;
  errorType: MistakeErrorType;
  source: string;
  qType: MistakeQuestionType;
  note: string;
  photoUrl: string | null;
  status: MistakeStatus;
  stage: number;
  nextDue: string | null;
  sourceKind: string | null;
  sourceRefId: string | null;
  sourceLabel: string | null;
  createdAt: string;
  updatedAt: string;
  history: Array<{ ymd: string; at: number; stage: number }>;
};

type MistakeWithReviews = {
  id: string;
  studentId: string;
  subject: string;
  topic: string;
  subtopic: string;
  errorType: MistakeErrorType;
  source: string;
  qType: MistakeQuestionType;
  note: string;
  photoUrl: string | null;
  status: MistakeStatus;
  stage: number;
  nextDue: Date | null;
  sourceKind: string | null;
  sourceRefId: string | null;
  sourceLabel: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviews?: Array<{ stage: number; reviewedAt: Date }>;
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mapMistake(mistake: MistakeWithReviews): MistakeRecord {
  return {
    id: mistake.id,
    studentId: mistake.studentId,
    subject: mistake.subject,
    topic: mistake.topic,
    subtopic: mistake.subtopic,
    errorType: mistake.errorType,
    source: mistake.source,
    qType: mistake.qType,
    note: mistake.note,
    photoUrl: mistake.photoUrl,
    status: mistake.status,
    stage: mistake.stage,
    nextDue: mistake.nextDue ? toYmd(mistake.nextDue) : null,
    sourceKind: mistake.sourceKind,
    sourceRefId: mistake.sourceRefId,
    sourceLabel: mistake.sourceLabel,
    createdAt: mistake.createdAt.toISOString(),
    updatedAt: mistake.updatedAt.toISOString(),
    history:
      mistake.reviews?.map((review) => ({
        ymd: toYmd(review.reviewedAt),
        at: review.reviewedAt.getTime(),
        stage: review.stage,
      })) ?? [],
  };
}

export async function listForStudent(studentId: string): Promise<MistakeRecord[]> {
  const mistakes = await prisma.mistake.findMany({
    where: { studentId },
    orderBy: [{ status: "asc" }, { nextDue: "asc" }, { createdAt: "desc" }],
    include: { reviews: { orderBy: { reviewedAt: "asc" } } },
  });

  return mistakes.map(mapMistake);
}

export async function createForStudent(studentId: string, input: MistakeInput): Promise<MistakeRecord> {
  const now = new Date();
  const mistake = await prisma.mistake.create({
    data: {
      studentId,
      subject: input.subject,
      topic: input.topic,
      subtopic: input.subtopic ?? "",
      errorType: input.errorType ?? "islem",
      source: input.source ?? "",
      qType: input.qType ?? "klasik",
      note: input.note ?? "",
      photoUrl: input.photoUrl ?? null,
      sourceKind: input.sourceKind ?? null,
      sourceRefId: input.sourceRefId ?? null,
      sourceLabel: input.sourceLabel ?? null,
      status: "acik",
      stage: 0,
      nextDue: addDays(now, MIS_INTERVALS[0]),
    },
    include: { reviews: true },
  });

  return mapMistake(mistake);
}

export async function createBatchForStudent(studentId: string, items: MistakeInput[]): Promise<MistakeRecord[]> {
  return prisma.$transaction(items.map((item) => prisma.mistake.create({
    data: {
      studentId,
      subject: item.subject,
      topic: item.topic,
      subtopic: item.subtopic ?? "",
      errorType: item.errorType ?? "islem",
      source: item.source ?? "",
      qType: item.qType ?? "klasik",
      note: item.note ?? "",
      photoUrl: item.photoUrl ?? null,
      sourceKind: item.sourceKind ?? null,
      sourceRefId: item.sourceRefId ?? null,
      sourceLabel: item.sourceLabel ?? null,
      status: "acik",
      stage: 0,
      nextDue: addDays(new Date(), MIS_INTERVALS[0]),
    },
    include: { reviews: true },
  }))).then((mistakes) => mistakes.map(mapMistake));
}

export async function updateForStudent(
  mistakeId: string,
  studentId: string,
  patch: MistakePatchInput,
): Promise<MistakeRecord | null> {
  const existing = await prisma.mistake.findFirst({ where: { id: mistakeId, studentId }, select: { id: true } });
  if (!existing) return null;

  const mistake = await prisma.mistake.update({
    where: { id: mistakeId },
    data: patch,
    include: { reviews: { orderBy: { reviewedAt: "asc" } } },
  });

  return mapMistake(mistake);
}

export async function deleteForStudent(mistakeId: string, studentId: string): Promise<boolean> {
  const existing = await prisma.mistake.findFirst({ where: { id: mistakeId, studentId }, select: { id: true } });
  if (!existing) return false;
  await prisma.mistake.delete({ where: { id: mistakeId } });
  return true;
}

export async function reviewForStudent(mistakeId: string, studentId: string): Promise<MistakeRecord | null> {
  const existing = await prisma.mistake.findFirst({ where: { id: mistakeId, studentId } });
  if (!existing) return null;
  if (existing.status === "kapandi" || existing.stage >= MIS_INTERVALS.length) {
    return mapMistake({ ...existing, reviews: [] });
  }

  const nextStage = Math.min(existing.stage + 1, MIS_INTERVALS.length);
  const closed = nextStage >= MIS_INTERVALS.length;
  const mistake = await prisma.mistake.update({
    where: { id: mistakeId },
    data: {
      stage: nextStage,
      status: closed ? "kapandi" : "tekrar",
      nextDue: closed ? null : addDays(new Date(), MIS_INTERVALS[nextStage]),
      reviews: { create: { studentId, stage: nextStage } },
    },
    include: { reviews: { orderBy: { reviewedAt: "asc" } } },
  });

  return mapMistake(mistake);
}
