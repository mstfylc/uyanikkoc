import { afterEach, describe, expect, it } from "vitest";

import { getExamTrendSummaryForStudent, resetExamResultsForTests } from "@/mocks/exams";
import { DEMO_STUDENT_ID } from "@/mocks/assignments";

afterEach(() => {
  resetExamResultsForTests();
});

describe("exam results mock store", () => {
  it("returns upward trend for seeded TYT exams", () => {
    const summary = getExamTrendSummaryForStudent(DEMO_STUDENT_ID);

    expect(summary.latestNet).toBe(77);
    expect(summary.previousNet).toBe(70.25);
    expect(summary.trend).toBe("up");
    expect(summary.examType).toBe("TYT");
  });
});
