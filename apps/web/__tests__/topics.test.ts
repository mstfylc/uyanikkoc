import { afterEach, describe, expect, it } from "vitest";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";
import {
  createSubject,
  createTopic,
  listSubjectsForStudent,
  resetTopicsForTests,
  updateTopic,
} from "@/mocks/topics";
import { filterSubjectsForStudentExam, studentSinav } from "@/lib/design/student-exam";

afterEach(() => {
  resetTopicsForTests();
});

describe("topic tracking mock store", () => {
  it("creates user-defined subject and topic", () => {
    const subject = createSubject({
      studentId: DEMO_STUDENT_ID,
      examType: "TYT",
      name: "Fizik",
    });

    const topic = createTopic({
      subjectId: subject.id,
      studentId: DEMO_STUDENT_ID,
      name: "Hareket",
    });

    expect(topic?.name).toBe("Hareket");
    const listed = listSubjectsForStudent(DEMO_STUDENT_ID);
    expect(listed.some((item) => item.id === subject.id && item.topics.length === 1)).toBe(true);
  });

  it("toggles completed source on topic", () => {
    const subject = createSubject({
      studentId: DEMO_STUDENT_ID,
      examType: "TYT",
      name: "Matematik",
    });
    const topic = createTopic({
      subjectId: subject.id,
      studentId: DEMO_STUDENT_ID,
      name: "Turev",
    });
    if (!topic) throw new Error("topic missing");

    updateTopic(topic.id, DEMO_STUDENT_ID, { toggleSource: "Mikro Mat" });
    let updated = listSubjectsForStudent(DEMO_STUDENT_ID)[0]?.topics[0];
    expect(updated?.progress.completedSources).toContain("Mikro Mat");

    updateTopic(topic.id, DEMO_STUDENT_ID, { toggleSource: "Mikro Mat" });
    updated = listSubjectsForStudent(DEMO_STUDENT_ID)[0]?.topics[0];
    expect(updated?.progress.completedSources ?? []).not.toContain("Mikro Mat");
  });
});

describe("studentSinav", () => {
  it("returns sayisal track for demo student", () => {
    const profile = studentSinav({ email: "student@uyanik.local" });
    expect(profile.kind).toBe("YKS");
    expect(profile.subjects).toContain("Matematik");
  });

  it("filters subjects by exam profile", () => {
    const profile = studentSinav({ email: "student@uyanik.local" });
    const filtered = filterSubjectsForStudentExam(
      [
        { examType: "TYT", name: "Matematik" },
        { examType: "LGS", name: "Fen Bilimleri" },
      ],
      profile,
    );
    expect(filtered.map((item) => item.name)).toEqual(["Matematik"]);
  });
});
