import { sourcesForSubject } from "@/lib/design/kaynak-catalog";
import type { CurriculumRecord, CurriculumTopicGroup, SubjectRecord } from "@uyanik/database";

export const NET_CONFIG = {
  YKS: {
    TYT: [
      { ders: "Turkce", bas: 35, son: 35, max: 40 },
      { ders: "Matematik", bas: 20, son: 30, max: 40 },
      { ders: "Sosyal Bilimler", bas: 12, son: 18, max: 20 },
      { ders: "Fen Bilimleri", bas: 10, son: 16, max: 20 },
    ],
    AYT: [
      { ders: "Matematik", bas: 15, son: 33, max: 40 },
      { ders: "Fizik", bas: 9, son: 13, max: 14 },
      { ders: "Kimya", bas: 9, son: 14, max: 13 },
      { ders: "Biyoloji", bas: 11, son: 15, max: 13 },
    ],
  },
  LGS: {
    Sayisal: [
      { ders: "Matematik", bas: 9, son: 16, max: 20 },
      { ders: "Fen Bilimleri", bas: 11, son: 17, max: 20 },
    ],
    Sozel: [
      { ders: "Turkce", bas: 13, son: 18, max: 20 },
      { ders: "T.C. Inkılap Tarihi", bas: 6, son: 9, max: 10 },
      { ders: "Din Kulturu", bas: 7, son: 9, max: 10 },
      { ders: "Ingilizce", bas: 6, son: 8, max: 10 },
    ],
  },
} as const;

export type ExamTrack = keyof typeof NET_CONFIG;
export type TopicState = "done" | "progress" | "todo";

export type TopicMetricRow = {
  n: string;
  s: TopicState;
  soru: number;
  dogru: number;
  kaynak: string;
  kaynaklar: string[];
  kaynakDone: boolean[];
};

export type PerSubjectStats = {
  s: string;
  t: TopicMetricRow[];
  done: number;
  total: number;
  soru: number;
};

export type NetRow = { ders: string; bas: number; son: number; max: number };
export type NetGroup = { grp: string; rows: NetRow[] };

export type WeakTopic = TopicMetricRow & {
  subj: string;
  oran: number;
  yanlis: number;
};

export const TOPIC_STATUS: Record<TopicState, { label: string; tone: "success" | "warning" | "muted" }> = {
  done: { label: "Tamamlandi", tone: "success" },
  progress: { label: "Devam ediyor", tone: "warning" },
  todo: { label: "Bekliyor", tone: "muted" },
};

export const DAY_LABELS = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];
const WEEK_BASE = [120, 140, 95, 165, 110, 185, 60];
const COMPLETION_REF = 88;

export function resolveExamTrack(subjects: SubjectRecord[]): ExamTrack {
  if (subjects.some((subject) => subject.examType === "LGS")) {
    return "LGS";
  }
  return "YKS";
}

export function pickKaynak(subject: string, index: number): string {
  const sources = sourcesForSubject(subject);
  return sources[index % sources.length];
}

export function mapSubjectToTopicRows(subject: SubjectRecord): TopicMetricRow[] {
  const sources = sourcesForSubject(subject.name);
  let foundProgress = false;
  const rows: TopicMetricRow[] = [];

  for (const [index, topic] of subject.topics.entries()) {
    let state: TopicState;
    if (topic.progress.completed) {
      state = "done";
    } else if (!foundProgress) {
      state = "progress";
      foundProgress = true;
    } else {
      state = "todo";
    }

    const start = (index * 3) % Math.max(1, sources.length);
    const count = Math.min(sources.length, state === "todo" ? 1 : 1 + ((index + (state === "done" ? 1 : 0)) % 3));
    const kaynaklar = Array.from({ length: count }, (_, sourceIndex) => sources[(start + sourceIndex) % sources.length] ?? sources[0] ?? "");
    const uniqueSources = [...new Set(kaynaklar)];
    const completedSources = topic.progress.completedSources ?? [];
    const kaynakDone = uniqueSources.map((source, sourceIndex) =>
      completedSources.includes(source) || (state === "done" && sourceIndex < uniqueSources.length - (index % 2)),
    );
    const soru =
      state === "done" ? 50 + ((index * 23) % 90) : state === "progress" ? 20 + ((index * 7) % 20) : 0;
    const dogru = state === "todo" ? 0 : Math.round(soru * (0.62 + ((index * 5) % 20) / 100));

    rows.push({
      n: topic.name,
      s: state,
      soru,
      dogru,
      kaynak: uniqueSources[0] ?? sources[0] ?? "",
      kaynaklar: uniqueSources,
      kaynakDone,
    });
  }

  return rows;
}

export function buildPerSubjectStats(subjects: SubjectRecord[]): PerSubjectStats[] {
  return subjects.map((subject) => {
    const topics = mapSubjectToTopicRows(subject);
    return {
      s: subject.name,
      t: topics,
      done: subject.topics.filter((topic) => topic.progress.completed).length,
      total: subject.topics.length,
      soru: topics.reduce((sum, topic) => sum + topic.soru, 0),
    };
  });
}

export function scaleNet(gain: number, completion: number): number {
  return Math.round(gain * Math.min(1, completion / COMPLETION_REF));
}

export function buildNetData(examTrack: ExamTrack, completion: number): { groups: NetGroup[]; totalGain: number } {
  const source =
    examTrack === "YKS"
      ? [
          { grp: "TYT", rows: NET_CONFIG.YKS.TYT },
          { grp: "AYT", rows: NET_CONFIG.YKS.AYT },
        ]
      : [
          { grp: "Sayisal", rows: NET_CONFIG.LGS.Sayisal },
          { grp: "Sozel", rows: NET_CONFIG.LGS.Sozel },
        ];

  const groups = source.map(({ grp, rows }) => ({
    grp,
    rows: rows.map((row) => ({
      ...row,
      son: row.bas + scaleNet(row.son - row.bas, completion),
    })),
  }));

  const totalGain = groups.reduce(
    (sum, group) =>
      sum + group.rows.reduce((inner: number, row: NetRow) => inner + (row.son - row.bas), 0),
    0,
  );

  return { groups, totalGain };
}

export function buildWeekSoru(completion: number): { points: Array<{ l: string; v: number }>; total: number } {
  const factor = 0.42 + 0.58 * (completion / 100);
  const points = WEEK_BASE.map((value, index) => ({
    l: DAY_LABELS[index],
    v: Math.round(value * factor),
  }));
  const total = points.reduce((sum, point) => sum + point.v, 0);
  return { points, total };
}

export type QuestionChartMode = "daily" | "weekly" | "monthly";

export function buildQuestionTracking(
  completion: number,
  mode: QuestionChartMode,
  offset: number,
): { points: Array<{ label: string; value: number }>; total: number; caption: string } {
  const factor = 0.42 + 0.58 * (completion / 100);
  const shift = Math.max(0, offset);

  if (mode === "daily") {
    const base = WEEK_BASE.map((value, index) => ({
      label: DAY_LABELS[index],
      value: Math.round(value * factor * (1 - shift * 0.04)),
    }));
    const total = base.reduce((sum, point) => sum + point.value, 0);
    return {
      points: base,
      total,
      caption: shift === 0 ? "Bu hafta" : `${shift} hafta once`,
    };
  }

  if (mode === "weekly") {
    const points = Array.from({ length: 4 }, (_, index) => {
      const weekIndex = 3 - index + shift;
      const avg = WEEK_BASE.reduce((sum, value) => sum + value, 0) / WEEK_BASE.length;
      return {
        label: `H${weekIndex}`,
        value: Math.round(avg * factor * (0.82 + index * 0.06)),
      };
    });
    return {
      points,
      total: points.reduce((sum, point) => sum + point.value, 0),
      caption: "Haftalik toplam soru",
    };
  }

  const months = ["Oca", "Sub", "Mar", "Nis", "May", "Haz"];
  const now = new Date().getMonth();
  const points = Array.from({ length: 4 }, (_, index) => {
    const monthLabel = months[(now - 3 + index + 12) % 12] ?? "Ay";
    const avg = WEEK_BASE.reduce((sum, value) => sum + value, 0) / WEEK_BASE.length;
    return {
      label: monthLabel,
      value: Math.round(avg * 7 * factor * (0.75 + index * 0.08)),
    };
  });
  return {
    points,
    total: points.reduce((sum, point) => sum + point.value, 0),
    caption: "Aylik toplam soru",
  };
}

export function buildSubjectWeekDistribution(
  perSubj: PerSubjectStats[],
  weekTotal: number,
): Array<{ s: string; done: number }> {
  const totalSoru = perSubj.reduce((sum, subject) => sum + subject.soru, 0) || 1;
  return perSubj.map((subject) => ({
    s: subject.s,
    done: Math.max(1, Math.round((subject.soru / totalSoru) * weekTotal)),
  }));
}

export function groupTargetKey(subject: string, group: string): string {
  return `${subject}::${group}`;
}

export function defaultGroupTargets(
  curriculum: CurriculumRecord,
  subjectWeek: Array<{ s: string; done: number }>,
): Record<string, number> {
  const targets: Record<string, number> = {};
  const subjectNames = Object.keys(curriculum.subjects);

  for (const subject of subjectNames) {
    const groups = curriculum.subjects[subject] ?? [];
    const done = subjectWeek.find((item) => item.s === subject)?.done ?? 0;
    const per = Math.round((done * 1.25 / Math.max(1, groups.length)) / 5) * 5 || 10;
    for (const group of groups) {
      targets[groupTargetKey(subject, group.name)] = per;
    }
  }

  return targets;
}

export function subjTarget(
  subject: string,
  curriculum: CurriculumRecord,
  targets: Record<string, number>,
): number {
  return (curriculum.subjects[subject] ?? []).reduce(
    (sum, group) => sum + (targets[groupTargetKey(subject, group.name)] ?? 0),
    0,
  );
}

export function groupDone(
  subject: string,
  group: CurriculumTopicGroup,
  curriculum: CurriculumRecord,
  subjectWeek: Array<{ s: string; done: number }>,
): number {
  const groups = curriculum.subjects[subject] ?? [];
  const totalKonu = groups.reduce((sum, item) => sum + item.topics.length, 0) || 1;
  const done = subjectWeek.find((item) => item.s === subject)?.done ?? 0;
  return Math.round(done * (group.topics.length / totalKonu));
}

export function buildWeakTopics(perSubj: PerSubjectStats[]): WeakTopic[] {
  return perSubj
    .flatMap((subject) =>
      subject.t
        .filter((topic) => topic.soru > 0)
        .map((topic) => ({
          ...topic,
          subj: subject.s,
          oran: Math.round((topic.dogru / topic.soru) * 100),
          yanlis: topic.soru - topic.dogru,
        })),
    )
    .sort((left, right) => left.oran - right.oran)
    .slice(0, 5);
}
