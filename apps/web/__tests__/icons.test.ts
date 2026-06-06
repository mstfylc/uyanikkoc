import { describe, expect, it } from "vitest";

import { KI_ICON_MAP, parseKiIconRef, resolveKiIcon } from "@/lib/design/icon-paths";

describe("KiIcon mapping", () => {
  it("maps sidebar nav icons", () => {
    expect(resolveKiIcon("ki-element-11")).toBe("dashboard");
    expect(resolveKiIcon("ki-book-open")).toBe("book");
    expect(resolveKiIcon("ki-flame")).toBe("flame");
  });

  it("falls back to dashboard for unknown icons", () => {
    expect(resolveKiIcon("ki-unknown-icon")).toBe("dashboard");
  });

  it("parses ki name with utility classes", () => {
    expect(parseKiIconRef("ki-flash text-white text-xl")).toEqual({
      icon: "bolt",
      className: "text-white text-xl",
    });
  });

  it("covers all uk-nav icon names", () => {
    const navIcons = [
      "ki-element-11",
      "ki-calendar",
      "ki-book-open",
      "ki-chart-simple",
      "ki-notepad-edit",
      "ki-calendar-tick",
      "ki-star",
      "ki-messages",
      "ki-flame",
      "ki-technology-2",
      "ki-wallet",
      "ki-people",
      "ki-chart-line-up",
      "ki-dollar",
      "ki-message-text",
      "ki-setting-2",
      "ki-profile-circle",
      "ki-notification-on",
    ];

    for (const icon of navIcons) {
      expect(KI_ICON_MAP[icon]).toBeTruthy();
    }
  });
});
