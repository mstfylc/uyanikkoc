import { describe, expect, it } from "vitest";

import { calculateTopicCompletionRate } from "../topic-insights";

describe("calculateTopicCompletionRate", () => {
  it("returns 0 when there are no topics", () => {
    expect(calculateTopicCompletionRate(0, 0)).toBe(0);
  });

  it("rounds completion percentage", () => {
    expect(calculateTopicCompletionRate(3, 1)).toBe(33);
    expect(calculateTopicCompletionRate(4, 3)).toBe(75);
  });
});
