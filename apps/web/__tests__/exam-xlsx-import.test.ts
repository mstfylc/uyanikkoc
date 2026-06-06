import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  inferExamTypeFromText,
  normalizeHeader,
  parseDenemeXlsx,
} from "@/lib/coach/exam-xlsx-import";

describe("exam-xlsx-import", () => {
  it("normalizes Turkish headers for matching", () => {
    expect(normalizeHeader("Ad ve Soyad")).toBe("AD VE SOYAD");
    expect(normalizeHeader("Şube")).toBe("SUBE");
    expect(normalizeHeader("MATEMATİK")).toBe("MATEMATIK");
  });

  it("infers AYT from OZDEBIR filename", () => {
    expect(inferExamTypeFromText("OZDEBIR TG AYT-5 Sirali Liste.xlsx")).toBe("AYT");
    expect(inferExamTypeFromText("OZDEBIR TG TYT-5 Sirali Liste.xlsx")).toBe("TYT");
  });

  it("parses OZDEBIR AYT sirali liste fixture", async () => {
    const fixtureDir = path.join(process.cwd(), "__tests__", "fixtures");
    const fixtureName = fs
      .readdirSync(fixtureDir)
      .find((name) => name.includes("AYT") && name.endsWith(".xlsx"));

    if (!fixtureName) {
      return;
    }

    const buffer = fs.readFileSync(path.join(fixtureDir, fixtureName));
    const parsed = await parseDenemeXlsx(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      fixtureName,
    );

    expect(parsed.examType).toBe("AYT");
    expect(parsed.students.length).toBeGreaterThan(0);
    expect(parsed.subjects.length).toBeGreaterThanOrEqual(4);
    expect(parsed.previewColumns).toEqual(parsed.subjects);
    expect(parsed.students[0]?.detail.length).toBeGreaterThan(0);
    expect(parsed.students[0]?.toplamNet).toBeGreaterThan(0);
  });
});
