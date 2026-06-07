import { describe, expect, it } from "vitest";

import { formatPhoneTR, maskPhone, normalizePhoneTR } from "../phone";

describe("normalizePhoneTR", () => {
  it("normalizes common TR formats to E.164", () => {
    expect(normalizePhoneTR("0555 123 45 67")).toBe("+905551234567");
    expect(normalizePhoneTR("5551234567")).toBe("+905551234567");
    expect(normalizePhoneTR("+90 555 123 45 67")).toBe("+905551234567");
    expect(normalizePhoneTR("905551234567")).toBe("+905551234567");
    expect(normalizePhoneTR("0 (555) 123-45-67")).toBe("+905551234567");
  });

  it("rejects invalid input", () => {
    expect(normalizePhoneTR("")).toBeNull();
    expect(normalizePhoneTR(null)).toBeNull();
    expect(normalizePhoneTR("12345")).toBeNull();
    expect(normalizePhoneTR("0655 123 45 67")).toBeNull(); // 6 ile başlamaz
    expect(normalizePhoneTR("05551234")).toBeNull(); // eksik hane
  });
});

describe("maskPhone / formatPhoneTR", () => {
  it("masks the middle digits", () => {
    expect(maskPhone("+905551234567")).toBe("+90 55• ••• 45 67");
  });

  it("formats with spaces", () => {
    expect(formatPhoneTR("+905551234567")).toBe("+90 555 123 45 67");
  });
});
