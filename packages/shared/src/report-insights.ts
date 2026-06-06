export type ReportDetail = {
  hours: number;
  assignDone: number;
  assignTotal: number;
  examCount: number;
  subjects: { name: string; pct: number }[];
};

/** Rapor icerigini tamamlama + net'ten deterministik uretir. */
export function buildReportDetail(input: {
  completion: number;
  net: string;
  studentName: string;
}): ReportDetail {
  const c = input.completion;
  const assignTotal = 12;
  const subs = ["Matematik", "Fizik", "Kimya", "Turkce"];
  return {
    hours: Math.round((c / 100) * 18 + 6),
    assignDone: Math.round((assignTotal * c) / 100),
    assignTotal,
    examCount: 2,
    subjects: subs.map((name, i) => ({
      name,
      pct: Math.max(35, Math.min(98, c - 12 + i * 7 + ((input.studentName.length * (i + 1)) % 14))),
    })),
  };
}
