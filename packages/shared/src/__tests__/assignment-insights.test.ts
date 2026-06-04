import { describe, expect, it } from "vitest";

import {
  buildCoachSuggestion,
  buildParentWeeklyComment,
  buildRulesBasedRiskBand,
  buildStudentPriorityAssignment,
  calculateCompletionRate,
  countOverdueAssignments,
} from "../assignment-insights";

describe("calculateCompletionRate", () => {
  it("yuzde hesaplar", () => {
    expect(calculateCompletionRate(10, 7)).toBe(70);
    expect(calculateCompletionRate(0, 0)).toBe(0);
  });
});

describe("countOverdueAssignments", () => {
  it("gecikmis acik odevleri sayar", () => {
    const count = countOverdueAssignments(
      [
        { dueDate: "2020-01-01", status: "pending", completed: false },
        { dueDate: "2099-01-01", status: "pending", completed: false },
        { dueDate: "2020-01-01", status: "completed", completed: true },
      ],
      new Date("2026-06-03"),
    );

    expect(count).toBe(1);
  });
});

describe("buildRulesBasedRiskBand", () => {
  it("tamamlama ve gecikmeye gore band dondurur", () => {
    expect(buildRulesBasedRiskBand(90, 0)).toBe("excellent");
    expect(buildRulesBasedRiskBand(90, 3)).toBe("attention");
    expect(buildRulesBasedRiskBand(20, 2)).toBe("critical");
  });
});

describe("buildCoachSuggestion", () => {
  it("gecikme durumunda oneri uretir", () => {
    expect(buildCoachSuggestion(50, 2, 3)).toContain("gecikmis");
  });
});

describe("buildParentWeeklyComment", () => {
  it("tamamlanmis hafta icin olumlu yorum dondurur", () => {
    expect(buildParentWeeklyComment(100, 0, 0)).toContain("Harika");
  });
});

describe("buildStudentPriorityAssignment", () => {
  it("yuksek oncelikli ve yakin tarihli odevi secer", () => {
    const priority = buildStudentPriorityAssignment(
      [
        {
          title: "Dusuk",
          dueDate: "2026-06-10",
          status: "pending",
          completed: false,
          priority: "low",
        },
        {
          title: "Yuksek",
          dueDate: "2026-06-05",
          status: "pending",
          completed: false,
          priority: "high",
        },
      ],
      new Date("2026-06-03"),
    );

    expect(priority?.title).toBe("Yuksek");
  });
});
