import { afterEach, describe, expect, it } from "vitest";

import {
  createSubject,
  createTopic,
  listSubjectsForStudent,
  resetTopicsForTests,
} from "@/mocks/topics";
import { DEMO_STUDENT_ID } from "@/mocks/assignments";

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
});
