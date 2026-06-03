import { describe, expect, it } from "vitest";

import {
  calculateNet,
  calculateRiskScore,
  calculateStreak,
  calculateTotalNet,
  getRiskBand,
  subjectsByTrack,
} from "../index";

describe("calculateNet", () => {
  it("dogru ve yanlis net hesaplar", () => {
    expect(calculateNet(40, 4)).toBe(39);
  });

  it("negatif net 0 olarak döner", () => {
    expect(calculateNet(0, 8)).toBe(-2);
    expect(calculateNet(0, 0)).toBe(0);
  });
});

describe("calculateTotalNet", () => {
  it("sonuclarin toplam netini hesaplar", () => {
    expect(
      calculateTotalNet([
        { correct: 10, wrong: 0 },
        { correct: 8, wrong: 4 },
      ]),
    ).toBe(17);
  });
});

describe("calculateRiskScore", () => {
  it("risk band sınırlarını doğru hesaplar", () => {
    expect(
      calculateRiskScore({
        activity: 75,
        assignments: 75,
        academic: 75,
        streak: 75,
        communication: 75,
      }).band,
    ).toBe("excellent");
    expect(
      calculateRiskScore({
        activity: 74,
        assignments: 74,
        academic: 74,
        streak: 74,
        communication: 74,
      }).band,
    ).toBe("normal");
    expect(
      calculateRiskScore({
        activity: 49,
        assignments: 49,
        academic: 49,
        streak: 49,
        communication: 49,
      }).band,
    ).toBe("attention");
    expect(
      calculateRiskScore({
        activity: 24,
        assignments: 24,
        academic: 24,
        streak: 24,
        communication: 24,
      }).band,
    ).toBe("critical");
  });
});

describe("getRiskBand", () => {
  it("skor araliklarini dondurur", () => {
    expect(getRiskBand(80)).toBe("excellent");
    expect(getRiskBand(60)).toBe("normal");
    expect(getRiskBand(30)).toBe("attention");
    expect(getRiskBand(10)).toBe("critical");
  });
});

describe("subjectsByTrack", () => {
  it("TYT derslerini doğru listeler", () => {
    expect(subjectsByTrack.TYT).toContain("Matematik");
    expect(subjectsByTrack.TYT).toContain("Türkçe");
  });
});

describe("calculateStreak", () => {
  it("ardisik gun serisini hesaplar", () => {
    expect(calculateStreak(["2026-06-01", "2026-06-02", "2026-06-03"], "2026-06-03")).toBe(3);
  });
});
