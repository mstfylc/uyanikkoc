import { describe, expect, it } from "vitest";

import {
  buildExamTrendSummaryFromRecords,
  describeExamTrend,
  formatExamNet,
} from "../exam-insights";

describe("exam insights", () => {
  it("formats net with one decimal", () => {
    expect(formatExamNet(72.25)).toBe("72.3");
  });

  it("detects upward trend between latest exams", () => {
    const summary = buildExamTrendSummaryFromRecords([
      { totalNet: 68, takenAt: "2026-05-01T00:00:00.000Z" },
      { totalNet: 72.5, takenAt: "2026-06-01T00:00:00.000Z" },
    ]);

    expect(summary.latestNet).toBe(72.5);
    expect(summary.previousNet).toBe(68);
    expect(summary.trend).toBe("up");
    expect(describeExamTrend(summary.trend)).toBe("Yukari trend");
  });
});
