export type ExamTrend = "up" | "down" | "flat";

export type ExamTrendInput = {
  totalNet: number;
  takenAt: string;
};

export const RESULT_EXAM_TYPE_LABELS: Record<"TYT" | "AYT" | "LGS", string> = {
  TYT: "TYT",
  AYT: "AYT",
  LGS: "LGS",
};

export function formatExamNet(net: number): string {
  return net.toFixed(1);
}

export function buildExamTrendSummaryFromRecords(
  exams: ExamTrendInput[],
): {
  latestNet: number | null;
  previousNet: number | null;
  trend: ExamTrend;
  examCount: number;
} {
  const sorted = [...exams].sort(
    (left, right) => new Date(right.takenAt).getTime() - new Date(left.takenAt).getTime(),
  );
  const latest = sorted[0];
  const previous = sorted[1];

  let trend: ExamTrend = "flat";
  if (latest && previous) {
    if (latest.totalNet > previous.totalNet) {
      trend = "up";
    } else if (latest.totalNet < previous.totalNet) {
      trend = "down";
    }
  }

  return {
    latestNet: latest?.totalNet ?? null,
    previousNet: previous?.totalNet ?? null,
    trend,
    examCount: sorted.length,
  };
}

export function describeExamTrend(trend: ExamTrend): string {
  if (trend === "up") {
    return "Yukari trend";
  }
  if (trend === "down") {
    return "Asagi trend";
  }
  return "Sabit trend";
}
