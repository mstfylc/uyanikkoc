import { describe, expect, it } from "vitest";

import {
  annualSavingAmount,
  annualSavingMonths,
  computeInstallmentTotal,
  formatTRY,
  planMonthlyEquivalent,
} from "../billing";

const PLUS = { monthly: 2299, annual: 22990 };

describe("billing pricing helpers", () => {
  it("tek cekim ve vade farksiz taksitlerde tutar degismez", () => {
    expect(computeInstallmentTotal(22990, 1)).toBe(22990);
    expect(computeInstallmentTotal(22990, 3)).toBe(22990);
  });

  it("vade farki uygulanir", () => {
    expect(computeInstallmentTotal(22990, 6)).toBe(Math.round(22990 * 1.04));
    expect(computeInstallmentTotal(22990, 12)).toBe(Math.round(22990 * 1.13));
  });

  it("yillik alimda ~2 ay bedava", () => {
    expect(annualSavingMonths(PLUS)).toBe(2);
    expect(annualSavingAmount(PLUS)).toBe(2299 * 12 - 22990);
  });

  it("aylik esdeger hesaplar", () => {
    expect(planMonthlyEquivalent(PLUS, "annual")).toBe(Math.round(22990 / 12));
    expect(planMonthlyEquivalent(PLUS, "monthly")).toBe(2299);
  });

  it("TRY bicimlendirir", () => {
    expect(formatTRY(22990)).toBe("₺22.990");
  });
});
