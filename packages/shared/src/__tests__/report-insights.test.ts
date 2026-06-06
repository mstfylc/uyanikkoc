import { describe, expect, it } from "vitest";

import { buildReportDetail } from "../report-insights";

describe("buildReportDetail", () => {
  it("uretir deterministik detay", () => {
    const detail = buildReportDetail({ completion: 72, net: "+3.2", studentName: "Ali" });
    expect(detail.assignTotal).toBe(12);
    expect(detail.assignDone).toBe(9);
    expect(detail.subjects).toHaveLength(4);
  });
});
