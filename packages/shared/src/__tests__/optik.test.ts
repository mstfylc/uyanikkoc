import { describe, expect, it } from "vitest";

import { gradeOptik, optikNetCoef } from "../optik";

describe("optik grading", () => {
  it("TYT net = doğru - yanlış/4", () => {
    const key = ["A", "B", "C", "D", "E"];
    const ans = ["A", "B", "C", "X", ""]; // 3D, 1Y, 1B
    expect(gradeOptik(ans, key, "TYT")).toEqual({ correct: 3, wrong: 1, blank: 1, net: 2.75 });
  });

  it("LGS net = doğru - yanlış/3", () => {
    const key = ["A", "B", "C", "D"];
    const ans = ["A", "X", "Y", ""]; // 1D, 2Y, 1B
    expect(gradeOptik(ans, key, "LGS")).toEqual({ correct: 1, wrong: 2, blank: 1, net: 0.33 });
  });

  it("net negatif olmaz", () => {
    const key = ["A", "A", "A", "A"];
    const ans = ["B", "B", "B", "B"];
    expect(gradeOptik(ans, key, "TYT").net).toBe(0);
  });

  it("katsayılar doğru", () => {
    expect(optikNetCoef("TYT")).toBe(4);
    expect(optikNetCoef("AYT")).toBe(4);
    expect(optikNetCoef("LGS")).toBe(3);
  });
});
