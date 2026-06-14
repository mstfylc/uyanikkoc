import type { CurriculumRecord, ExamResultRecord, SubjectRecord, TopicRecord } from "@uyanik/database";
import { calculateCompletionRate } from "@uyanik/shared";

export type SmartIntensityKey = "low" | "mid" | "high";
export type SmartFocusKey = "tekrar" | "karma" | "yeni";
export type SmartOdevTypeKey = "soru" | "video" | "konu";

export const SM_INTENSITY: Record<SmartIntensityKey, { label: string; soru: [number, number]; perDay: number }> = {
  low: { label: "Düşük", soru: [15, 25], perDay: 1 },
  mid: { label: "Orta", soru: [25, 40], perDay: 1 },
  high: { label: "Yüksek", soru: [40, 55], perDay: 2 },
};

export const SM_FOCUS: Record<SmartFocusKey, { label: string; word: string }> = {
  tekrar: { label: "Tekrar", word: "tekrar" },
  karma: { label: "Karma", word: "karma" },
  yeni: { label: "Yeni konu", word: "yeni konu" },
};

export const SM_DOW = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

export const SMART_ODEV_TYPES: Record<SmartOdevTypeKey, string> = {
  soru: "Soru Çözümü",
  video: "Video İzleme",
  konu: "Konu Çalışması",
};

export type SmartPlanOpts = {
  intensity: SmartIntensityKey;
  days: number;
  focus: SmartFocusKey;
  source: string;
  overdueAlert: boolean;
  quality: boolean;
};

export type TopicStatus = "done" | "progress" | "todo";

export type SmartTopicRef = {
  subject: string;
  topic: string;
  status: TopicStatus;
};

export type SmartPlanItem = {
  uid: string;
  day: number;
  subject: string;
  topic: string;
  type: SmartOdevTypeKey;
  count: number;
  source: string;
  status: TopicStatus;
};

export type SmartSignals = {
  name: string;
  sinav: string;
  curriculum: CurriculumRecord | null;
  subs: Array<{
    subject: string;
    list: Array<{ n: string; s: TopicStatus }>;
    done: number;
    prog: number;
    total: number;
    pct: number;
  }>;
  weak: Array<{
    subject: string;
    list: Array<{ n: string; s: TopicStatus }>;
    done: number;
    prog: number;
    total: number;
    pct: number;
  }>;
  completion: number;
  net: number;
  netDelta: number;
  goal: string;
  targetNet: number;
  progCount: number;
  todoCount: number;
  availDays: number;
};

type AssignmentRow = {
  studentId: string;
  completed: boolean;
};

function topicStatus(topic: TopicRecord): TopicStatus {
  if (topic.progress.completed) {
    return "done";
  }
  if (topic.progress.inProgress) {
    return "progress";
  }
  return "todo";
}

export function buildSmartSignals(
  studentName: string,
  studentId: string,
  subjects: SubjectRecord[],
  assignments: AssignmentRow[],
  exams: ExamResultRecord[],
  curriculum: CurriculumRecord | null,
): SmartSignals {
  const studentAssignments = assignments.filter((item) => item.studentId === studentId);
  const total = studentAssignments.length;
  const completed = studentAssignments.filter((item) => item.completed).length;
  const completion = calculateCompletionRate(total, completed);

  const subs = subjects.map((subject) => {
    const list = subject.topics.map((topic) => ({ n: topic.name, s: topicStatus(topic) }));
    const done = list.filter((t) => t.s === "done").length;
    const prog = list.filter((t) => t.s === "progress").length;
    const totalTopics = list.length;
    const pct = totalTopics ? Math.round((done / totalTopics) * 100) : 0;
    return { subject: subject.name, list, done, prog, total: totalTopics, pct };
  });

  const weak = [...subs].filter((x) => x.total).sort((a, b) => a.pct - b.pct).slice(0, 3);

  const studentExams = exams
    .filter((exam) => exam.studentId === studentId)
    .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime());
  const trend = studentExams.map((exam) => exam.totalNet);
  const net = trend[trend.length - 1] ?? 0;
  const netDelta = trend.length >= 2 ? trend[trend.length - 1] - trend[trend.length - 2] : 0;

  const examType = curriculum?.examType ?? subjects[0]?.examType ?? "TYT";
  const sinav = examType === "LGS" ? "LGS" : "YKS";
  const goal = `${sinav} 2026`;
  const targetNet = net ? net + Math.max(18, Math.round(net * 0.08)) : 0;
  const progCount = subs.reduce((a, x) => a + x.prog, 0);
  const todoCount = subs.reduce((a, x) => a + (x.total - x.done - x.prog), 0);
  const availDays = completion >= 80 ? 6 : completion >= 60 ? 5 : 4;

  return {
    name: studentName,
    sinav,
    curriculum,
    subs,
    weak,
    completion,
    net,
    netDelta,
    goal,
    targetNet,
    progCount,
    todoCount,
    availDays,
  };
}

export function defaultSmartOpts(sig: SmartSignals): SmartPlanOpts {
  const intensity: SmartIntensityKey = sig.completion < 65 ? "low" : sig.completion < 85 ? "mid" : "high";
  const focus: SmartFocusKey =
    sig.progCount >= 3 ? "tekrar" : sig.todoCount > sig.progCount * 2 ? "yeni" : "karma";
  const days = Math.min(sig.availDays, intensity === "low" ? 3 : intensity === "mid" ? 4 : 5);
  return { intensity, days, focus, source: "free", overdueAlert: true, quality: true };
}

export function topicsOfSubject(sig: SmartSignals, subject: string): string[] {
  const fromCurriculum = sig.curriculum?.subjects[subject];
  if (fromCurriculum) {
    return fromCurriculum.flatMap((group) => group.topics);
  }
  const sub = sig.subs.find((s) => s.subject === subject);
  return sub ? sub.list.map((t) => t.n) : [];
}

export function generateSmartPlan(sig: SmartSignals, opts: SmartPlanOpts): SmartPlanItem[] {
  const ic = SM_INTENSITY[opts.intensity];
  const targets: SmartTopicRef[] = [];

  sig.weak.forEach((wd) => {
    const prog = wd.list.filter((t) => t.s === "progress");
    const todo = wd.list.filter((t) => t.s === "todo");
    const doneL = wd.list.filter((t) => t.s === "done");
    let ordered: Array<{ n: string; s: TopicStatus }>;
    if (opts.focus === "tekrar") {
      ordered = [...prog, ...doneL, ...todo];
    } else if (opts.focus === "yeni") {
      ordered = [...todo, ...prog];
    } else {
      ordered = [...prog, ...todo, ...doneL];
    }
    ordered.slice(0, 2).forEach((t) => targets.push({ subject: wd.subject, topic: t.n, status: t.s }));
  });

  if (targets.length === 0 && sig.subs[0]) {
    sig.subs[0].list.slice(0, 3).forEach((t) =>
      targets.push({ subject: sig.subs[0]!.subject, topic: t.n, status: t.s }),
    );
  }

  const cap = Math.max(opts.days, Math.min(opts.days * ic.perDay, targets.length || opts.days));
  const chosen = targets.slice(0, cap);
  const [lo, hi] = ic.soru;

  return chosen.map((t, i) => {
    const dayIdx = i % opts.days;
    const isNew = t.status === "todo" && opts.focus !== "tekrar";
    const type: SmartOdevTypeKey = isNew ? "konu" : "soru";
    const count = type === "soru" ? Math.round((lo + (hi - lo) * ((i % 3) / 2)) / 5) * 5 : 0;
    return {
      uid: `it${i}_${Date.now()}`,
      day: dayIdx,
      subject: t.subject,
      topic: t.topic,
      type,
      count,
      source: opts.source,
      status: t.status,
    };
  });
}

export function smartPlanSentence(sig: SmartSignals, opts: SmartPlanOpts): string {
  const first = sig.name.split(" ")[0];
  const w = sig.weak[0];
  const w2 = sig.weak[1];
  const weakStr = w ? w.subject + (w2 ? ` ve ${w2.subject}` : "") : "zayıf dersleri";
  const compTone = sig.completion < 65 ? "düşük kaldı" : sig.completion < 85 ? "orta seviyede" : "yüksek";
  const ic = SM_INTENSITY[opts.intensity];
  return `${first}, ${weakStr} konularında geride (${w ? `%${w.pct}` : ""}). Geçen hafta ödev tamamlama oranı %${sig.completion} (${compTone}). Bu hafta ${opts.days} güne bölünmüş, ${ic.label.toLowerCase()} yoğunluklu, ${SM_FOCUS[opts.focus].word} ağırlıklı bir plan önerdim.`;
}

export function sourceLabel(source: string): string {
  if (source === "free") {
    return "Kaynak fark etmez";
  }
  if (source === "pdf") {
    return "Koç PDF / föy";
  }
  return source;
}

export function dueDateForPlanDay(dayIndex: number): string {
  const due = new Date();
  due.setDate(due.getDate() + dayIndex + 1);
  return due.toISOString().slice(0, 10);
}
