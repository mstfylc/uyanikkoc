import { afterEach, describe, expect, it } from "vitest";

import {
  addSource,
  listSources,
  removeSource,
  resetStudentSourcesForTests,
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
});
