import type { AppointmentRecord, AssignmentRecord, MessageThreadRecord, NotificationRecord } from "@uyanik/database";

type ResultLike = { correct: number; wrong: number; blank: number; net: number };
type ContractOdevType = "soru" | "video" | "konu" | "test";
type ContractWeek = "w0" | "w1" | "w2" | "w3";

type MistakeLike = {
  id: string;
  studentId: string;
  subject: string;
  topic: string | null;
  subtopic: string;
  errorType: string;
  source: string;
  qType: string;
  note: string;
  photoUrl: string | null;
  status: string;
  stage: number;
  nextDue: string | null;
  createdAt: string;
  history: Array<{ ymd: string; at: number }>;
};

const ASSIGNMENT_TYPE_TO_ODEV: Record<string, "soru" | "video" | "konu" | "test"> = {
  homework: "soru",
  practice: "soru",
  exam_prep: "test",
  reading: "konu",
  other: "konu",
};
const ODEV_TYPES = new Set<ContractOdevType>(["soru", "video", "konu", "test"]);
const WEEKS = new Set<ContractWeek>(["w0", "w1", "w2", "w3"]);

function ymd(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

function epoch(value: string | null | undefined): number {
  return value ? new Date(value).getTime() : Date.now();
}

export function toOdevContract(item: AssignmentRecord) {
  const odevType = item.odevType ?? ASSIGNMENT_TYPE_TO_ODEV[item.type] ?? "soru";
  const result = item.result as ResultLike | null | undefined;

  return {
    id: item.id,
    student: item.studentName ?? item.studentId,
    studentId: item.studentId,
    week: item.week,
    subject: item.subject ?? "Genel",
    topic: item.topic || item.title,
    source: item.source,
    count: item.count,
    type: odevType,
    types: item.odevTypes.length ? item.odevTypes : [odevType],
    note: item.note || item.description || "",
    due: ymd(item.dueDate),
    status: item.completed || item.status === "completed" ? "done" : "pending",
    result: result
      ? {
          d: result.correct,
          y: result.wrong,
          b: result.blank,
        }
      : null,
    feedback: item.feedback ?? undefined,
    assignedAt: epoch(item.assignedAt ?? item.createdAt),
    smart: item.smart || undefined,
    overdueAlert: item.overdueAlert || undefined,
    quality: item.quality || undefined,
  };
}

export function fromOdevContract(body: {
  title?: string;
  studentId?: string;
  student?: string;
  week?: string;
  subject?: string;
  topic?: string;
  source?: string;
  count?: number;
  type?: string;
  types?: string[];
  note?: string;
  due?: string;
  dueDate?: string;
  smart?: boolean;
  overdueAlert?: boolean;
  quality?: boolean;
  feedback?: string;
}) {
  const topic = body.topic?.trim() || body.title?.trim() || "Ödev";
  const count = Number.isFinite(body.count) ? Math.max(0, Math.round(body.count ?? 0)) : 0;
  const rawType = body.type?.trim();
  const odevType = ODEV_TYPES.has(rawType as ContractOdevType) ? (rawType as ContractOdevType) : "soru";
  const week = WEEKS.has(body.week as ContractWeek) ? (body.week as ContractWeek) : "w0";
  const types = (body.types ?? []).filter((type): type is ContractOdevType =>
    ODEV_TYPES.has(type as ContractOdevType),
  );

  return {
    title: body.title?.trim() || topic,
    studentId: body.studentId,
    week,
    subject: body.subject ?? "Genel",
    topic,
    source: body.source ?? "",
    count,
    odevType,
    odevTypes: types.length ? types : [odevType],
    note: body.note ?? "",
    dueDate: body.dueDate ?? body.due ?? null,
    description: body.note ?? null,
    type: odevType === "test" ? "exam_prep" : odevType === "konu" || odevType === "video" ? "reading" : "practice",
    smart: body.smart ?? false,
    overdueAlert: body.overdueAlert ?? false,
    quality: body.quality ?? false,
    feedback: body.feedback ?? null,
  } as const;
}

export function toMistakeContract(item: MistakeLike, studentName?: string | null) {
  return {
    id: item.id,
    student: studentName ?? item.studentId,
    studentId: item.studentId,
    createdAt: epoch(item.createdAt),
    subject: item.subject,
    topic: item.topic ?? "",
    subtopic: item.subtopic,
    errorType: item.errorType,
    source: item.source,
    qType: item.qType,
    note: item.note,
    photo: item.photoUrl,
    status: item.status,
    stage: item.stage,
    nextDue: item.nextDue,
    history: item.history.map((entry) => ({ ymd: entry.ymd, at: entry.at })),
  };
}

export function toNotificationContract(item: NotificationRecord) {
  return {
    id: item.id,
    icon: item.icon ?? "message",
    tone: item.tone ?? "info",
    title: item.title,
    desc: item.body,
    page: item.page ?? "dashboard",
    read: item.read,
    createdAt: epoch(item.createdAt),
  };
}

function contractMode(mode: AppointmentRecord["mode"]): "online" | "yuzyuze" | "telefon" {
  if (mode === "in_person") return "yuzyuze";
  if (mode === "phone") return "telefon";
  return "online";
}

export function toAppointmentContract(item: AppointmentRecord, coachName = "Dilek Emen") {
  return {
    id: item.id,
    student: item.studentName,
    coach: coachName,
    day: item.day,
    slot: item.slot,
    mode: contractMode(item.mode),
    topic: item.topic,
    status: item.status,
  };
}

function contractRole(role: string): "coach" | "student" | "parent" {
  if (role === "COACH") return "coach";
  if (role === "PARENT") return "parent";
  return "student";
}

export function toMessagingContract(threads: MessageThreadRecord[], viewerRole: string) {
  const groups = threads
    .filter((thread) => thread.kind === "group")
    .map((thread) => ({
      id: thread.id,
      name: thread.name ?? thread.title,
      desc: thread.title,
      members: thread.memberUserIds ?? [],
      kind: "custom",
    }));

  const threadMap = Object.fromEntries(
    threads.map((thread) => [
      thread.kind === "group" ? thread.id : `dm:${thread.title}`,
      thread.messages.map((message) => ({
        from: contractRole(message.senderRole) === "coach" ? "Dilek Emen" : thread.title,
        role: contractRole(message.senderRole),
        t: message.body,
        time: new Date(message.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      })),
    ]),
  );

  const unread = Object.fromEntries(
    threads
      .filter((thread) => (thread.unreadCount ?? 0) > 0)
      .map((thread) => [`${viewerRole}::${thread.kind === "group" ? thread.id : `dm:${thread.title}`}`, thread.unreadCount ?? 0]),
  );

  return { groups, threads: threadMap, unread };
}
