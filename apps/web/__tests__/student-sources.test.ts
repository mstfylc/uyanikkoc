import { afterEach, describe, expect, it } from "vitest";

import { KAYNAK_CATALOG, kaynakLabel, sourcesForSubject } from "@/lib/design/kaynak-catalog";
import {
  addSelfStudy,
  addSource,
  getSourceTracker,
  listSources,
  removeSelfStudy,
  removeSource,
  resetStudentSourcesForTests,
  updateSource,
} from "@/mocks/student-sources";

afterEach(() => {
  resetStudentSourcesForTests();
});

describe("student sources", () => {
  it("adds unique sources and removes them", () => {
    expect(addSource("student_1", " Mikro Mat ")).toEqual(["Mikro Mat"]);
    expect(addSource("student_1", "Mikro Mat")).toEqual(["Mikro Mat"]);
    expect(addSource("student_1", "Paragraf Kampi")).toEqual(["Mikro Mat", "Paragraf Kampi"]);

    expect(removeSource("student_1", "Mikro Mat")).toEqual(["Paragraf Kampi"]);
    expect(listSources("student_1")).toEqual(["Paragraf Kampi"]);
  });

  it("tracks source status, progress and self study entries", () => {
    addSource("student_1", "Mikro Mat");

    expect(updateSource("student_1", "Mikro Mat", { progress: 35 })[0]).toMatchObject({
      name: "Mikro Mat",
      status: "aktif",
      progress: 35,
    });

    const self = addSelfStudy("student_1", {
      book: "Mikro Mat",
      kind: "cozdum",
      soru: 20,
      dogru: 16,
      subject: "Matematik",
    });
    expect(self).toHaveLength(1);

    const tracker = getSourceTracker("student_1");
    expect(tracker.items[0]).toMatchObject({ name: "Mikro Mat", status: "aktif" });
    expect(tracker.activity["Mikro Mat"]).toMatchObject({ selfSoru: 20, selfCount: 1, acc: 80 });

    expect(removeSelfStudy("student_1", self[0]!.id)).toEqual([]);
    expect(getSourceTracker("student_1").activity["Mikro Mat"]?.selfCount).toBe(0);
  });
});

describe("source catalog", () => {
  it("uses the real books_clean catalog for every user path", () => {
    expect(KAYNAK_CATALOG).toHaveLength(9108);
    expect(KAYNAK_CATALOG.some((entry) => kaynakLabel(entry) === "TONGUÇ ZORU 7 BANKASI  SÖZEL")).toBe(true);
  });

  it("maps curriculum subject aliases to the real catalog", () => {
    const hasText = (subject: string, text: string) =>
      sourcesForSubject(subject).some((label) => label.toLocaleUpperCase("tr-TR").includes(text));

    expect(hasText("Turkce", "TÜRKÇE")).toBe(true);
    expect(hasText("Ingilizce", "İNGİLİZCE")).toBe(true);
    expect(hasText("Din Kulturu", "DİN")).toBe(true);
  });
});
