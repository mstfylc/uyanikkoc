import { describe, expect, it } from "vitest";

import { allowedModes, slotSupportsMode, weeklyLimitFor } from "../appointments";

describe("appointments helpers", () => {
  it("allowedModes", () => {
    expect(allowedModes({ allowOnline: true, allowPhone: true })).toEqual(["online", "phone"]);
  });

  it("slotSupportsMode", () => {
    const avail = { Pzt: { "17:00": ["online", "phone"] as const } };
    expect(slotSupportsMode(avail, "Pzt", "17:00", "phone")).toBe(true);
    expect(slotSupportsMode(avail, "Pzt", "17:00", "in_person")).toBe(false);
  });

  it("weeklyLimitFor", () => {
    expect(weeklyLimitFor("student", { weeklyLimitStudent: 3 })).toBe(3);
    expect(weeklyLimitFor("parent", { weeklyLimitParent: 1 })).toBe(1);
  });
});
