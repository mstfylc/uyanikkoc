import { describe, expect, it } from "vitest";

import { answerScore, averageScore } from "../test-scoring";

describe("test scoring", () => {
  it("likert 0..4 -> 1..5", () => {
    expect(answerScore("likert", 3)).toBe(4);
  });

  it("yesno", () => {
    expect(answerScore("yesno", true)).toBe(5);
    expect(answerScore("yesno", false)).toBe(1);
  });

  it("averageScore", () => {
    expect(averageScore([4, 5, null])).toBe(4.5);
  });
});
