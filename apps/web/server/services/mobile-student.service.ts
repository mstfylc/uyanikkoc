import { shouldUseDatabase } from "@/lib/data/env";
import { listStudentAssignments, submitStudentAssignmentResult } from "@/server/services/assignment.service";
import { listStudentExams } from "@/server/services/exam.service";
import { getStudentStudyPlan } from "@/server/services/schedule.service";

export type OdevTypeKey = "soru" | "video" | "konu" | "test";
export type OdevStatus = "pending" | "done";

export interface OdevResult {
  d: number;
  y: number;
  b: number;
}

export interface Odev {
  id: string;
  week: string;
  subject: string;
  topic: string;
  types: OdevTypeKey[];
  count?: number;
  source: string;
  due: string;
  status: OdevStatus;
  note?: string;
  result?: OdevResult | null;
}

export interface Week {
  id: string;
  label: string;
  range: string;
}

export interface ExamPart {
  n: string;
  net: number;
  max: number;
}

export interface Exam {
  id: string;
  name: string;
  pub: string;
  type: string;
  date: string;
  net: number;
  rank: string;
  delta: string;
  parts: ExamPart[];
}

export interface TrendPoint {
  l: string;
  v: number;
}

export interface Upcoming {
  name: string;
  org: string;
  date: string;
  time: string;
}

export interface ScheduleBlock {
  t: string;
  e: string;
  subj: string;
  topic: string;
  type: string;
  done?: boolean;
}

const WEEKS: Week[] = [
  { id: "w0", label: "Bu hafta", range: "2 - 8 Haziran" },
  { id: "w1", label: "Gecen hafta", range: "26 May - 1 Haz" },
  { id: "w2", label: "2 hafta once", range: "19 - 25 May" },
];

const DAYS = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];
const DAYS_FULL: Record<string, string> = {
  Pzt: "Pazartesi",
  Sal: "Sali",
  Car: "Carsamba",
  Per: "Persembe",
  Cum: "Cuma",
  Cmt: "Cumartesi",
  Paz: "Pazar",
};
const TODAY = "Cmt";

function seedOdev(): Odev[] {
  return [
    { id: "o1", week: "w0", subject: "Matematik", topic: "Turev - kural tekrari (40 soru)", types: ["soru"], count: 40, source: "Uyanik YKS Soru Bankasi", due: "2026-06-06", status: "pending" },
    { id: "o2", week: "w0", subject: "Kimya", topic: "Mol Kavrami - TYT deneme bolumu", types: ["test"], count: 20, source: "345 Yayinlari TYT", due: "2026-06-05", status: "pending" },
    { id: "o3", week: "w0", subject: "Fizik", topic: "Newton'un Yasalari - konu ozeti + video", types: ["konu", "video"], source: "Hocalara Geldik", due: "2026-06-07", status: "pending", note: "Video sonrasi 10 soru coz" },
    { id: "o4", week: "w0", subject: "Turkce", topic: "Paragraf - hiz calismasi (30 soru)", types: ["soru"], count: 30, source: "Bilgi Sarmal Paragraf", due: "2026-06-08", status: "pending" },
    { id: "o5", week: "w0", subject: "Geometri", topic: "Ucgende aci - 25 soru", types: ["soru"], count: 25, source: "Apotemi Geometri", due: "2026-06-04", status: "done", result: { d: 21, y: 3, b: 1 } },
  ];
}

const EXAMS: Exam[] = [
  { id: "e6", name: "TYT Genel Deneme #6", pub: "Uyanik Yayinlari", type: "TYT", date: "1 Haz 2026", net: 88.0, rank: "~48.000", delta: "+1.75", parts: [{ n: "Turkce", net: 35.0, max: 40 }, { n: "Matematik", net: 28.5, max: 40 }] },
  { id: "e5", name: "TYT Genel Deneme #5", pub: "Uyanik Yayinlari", type: "TYT", date: "24 May 2026", net: 86.25, rank: "~52.000", delta: "+5.5", parts: [{ n: "Turkce", net: 33.75, max: 40 }, { n: "Matematik", net: 27.75, max: 40 }] },
];

const EXAM_TREND: TrendPoint[] = [
  { l: "1.D", v: 68 },
  { l: "2.D", v: 74 },
  { l: "3.D", v: 79.5 },
  { l: "4.D", v: 80.75 },
  { l: "5.D", v: 86.25 },
  { l: "6.D", v: 88 },
];

const UPCOMING: Upcoming = { name: "TYT Genel Deneme #7", org: "Uyanik Yayinlari", date: "8 Haziran Pazar", time: "10:00" };

const SCHEDULE: Record<string, ScheduleBlock[]> = {
  Pzt: [{ t: "16:00", e: "17:30", subj: "Matematik", topic: "Turev - kural tekrari", type: "Konu" }],
  Sal: [{ t: "16:00", e: "17:00", subj: "Kimya", topic: "Mol kavrami", type: "Soru" }],
  Car: [],
  Per: [],
  Cum: [],
  Cmt: [{ t: "09:00", e: "10:30", subj: "Matematik", topic: "Turev testi", type: "Test", done: true }],
  Paz: [],
};

interface StudentStore {
  odev: Odev[];
}

const globalRef = globalThis as typeof globalThis & { __ukMobileStudent?: StudentStore };
const store: StudentStore = (globalRef.__ukMobileStudent ??= { odev: seedOdev() });

function assignmentTypes(type: string): OdevTypeKey[] {
  if (type === "practice") return ["soru"];
  if (type === "reading") return ["konu"];
  if (type === "exam_prep") return ["test"];
  return ["soru"];
}

function isoDateOnly(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export async function getOdev(studentId?: string): Promise<{ weeks: Week[]; items: Odev[] }> {
  if (!shouldUseDatabase()) {
    return { weeks: WEEKS, items: store.odev };
  }
  if (!studentId) {
    return { weeks: WEEKS, items: [] };
  }

  const assignments = await listStudentAssignments(studentId);
  return {
    weeks: WEEKS,
    items: assignments.map((assignment) => ({
      id: assignment.id,
      week: "w0",
      subject: assignment.subject ?? "Genel",
      topic: assignment.title,
      types: assignmentTypes(assignment.type),
      source: assignment.description ?? "",
      due: isoDateOnly(assignment.dueDate),
      status: assignment.completed || assignment.status === "completed" ? "done" : "pending",
      note: assignment.description ?? undefined,
      result: assignment.result
        ? { d: assignment.result.correct, y: assignment.result.wrong, b: assignment.result.blank }
        : null,
    })),
  };
}

export async function saveOdevResult(studentId: string | undefined, id: string, result: OdevResult | null): Promise<Odev | null> {
  if (!shouldUseDatabase()) {
    const item = store.odev.find((o) => o.id === id);
    if (!item) return null;
    item.status = "done";
    item.result = result;
    return item;
  }
  if (!studentId) return null;

  const submitted = await submitStudentAssignmentResult(id, studentId, {
    correct: result?.d ?? 0,
    wrong: result?.y ?? 0,
    blank: result?.b ?? 0,
  });
  const assignment = submitted?.assignment;
  if (!assignment) return null;

  return {
    id: assignment.id,
    week: "w0",
    subject: assignment.subject ?? "Genel",
    topic: assignment.title,
    types: assignmentTypes(assignment.type),
    source: assignment.description ?? "",
    due: isoDateOnly(assignment.dueDate),
    status: "done",
    note: assignment.description ?? undefined,
    result,
  };
}

export async function getExams(studentId?: string): Promise<{ exams: Exam[]; trend: TrendPoint[]; upcoming: Upcoming }> {
  if (!shouldUseDatabase()) {
    return { exams: EXAMS, trend: EXAM_TREND, upcoming: UPCOMING };
  }
  if (!studentId) {
    return { exams: [], trend: [], upcoming: UPCOMING };
  }

  const { exams } = await listStudentExams(studentId);
  const mapped = exams.map((exam, index) => ({
    id: exam.id,
    name: exam.label ?? `${exam.examType} Deneme`,
    pub: "Uyanik Koc",
    type: exam.examType,
    date: new Date(exam.takenAt).toLocaleDateString("tr-TR"),
    net: exam.totalNet,
    rank: "-",
    delta: index < exams.length - 1 ? String(exam.totalNet - exams[index + 1]!.totalNet) : "0",
    parts: exam.subjects.map((subject) => ({ n: subject.subjectName, net: subject.net, max: 40 })),
  }));

  return {
    exams: mapped,
    trend: [...mapped].reverse().map((exam, index) => ({ l: `${index + 1}.D`, v: exam.net })),
    upcoming: UPCOMING,
  };
}

export async function getSchedule(studentId?: string): Promise<{ days: string[]; daysFull: Record<string, string>; today: string; schedule: Record<string, ScheduleBlock[]> }> {
  if (!shouldUseDatabase()) {
    return { days: DAYS, daysFull: DAYS_FULL, today: TODAY, schedule: SCHEDULE };
  }
  if (!studentId) {
    return { days: DAYS, daysFull: DAYS_FULL, today: TODAY, schedule: {} };
  }

  const blocks = await getStudentStudyPlan(studentId);
  const schedule = Object.fromEntries(DAYS.map((day) => [day, [] as ScheduleBlock[]]));
  for (const block of blocks) {
    const day = DAYS.includes(block.day) ? block.day : "Pzt";
    schedule[day]!.push({
      t: block.time,
      e: block.time,
      subj: block.subject,
      topic: block.topic,
      type: block.type,
      done: block.status === "done",
    });
  }

  return { days: DAYS, daysFull: DAYS_FULL, today: TODAY, schedule };
}
