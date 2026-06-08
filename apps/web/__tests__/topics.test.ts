import { afterEach, describe, expect, it } from "vitest";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";
import {
  createSubject,
  createTopic,
  listSubjectsForStudent,
  listStudySessionsForStudent,
  resetTopicsForTests,
  getCoachTopicTargets,
  updateTopic,
  upsertCoachTopicTargets,
  upsertStudySession,
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

  it("creates and updates topic study sessions for yearly grid", () => {
    const subject = createSubject({
      studentId: DEMO_STUDENT_ID,
      examType: "TYT",
      name: "Matematik",
    });
    const topic = createTopic({
      subjectId: subject.id,
      studentId: DEMO_STUDENT_ID,
      name: "Problemler",
    });
    if (!topic) throw new Error("topic missing");

    const created = upsertStudySession({
      topicId: topic.id,
      studentId: DEMO_STUDENT_ID,
      date: "2026-06-08T09:00:00.000Z",
      questionCount: 40,
      correctCount: 32,
    });

    expect(created?.subjectName).toBe("Matematik");
    expect(created?.topicName).toBe("Problemler");
    expect(created?.questionCount).toBe(40);

    const updated = upsertStudySession({
      id: created?.id,
      topicId: topic.id,
      studentId: DEMO_STUDENT_ID,
      date: "2026-06-08T09:00:00.000Z",
      questionCount: 45,
      correctCount: 36,
    });

    expect(updated?.id).toBe(created?.id);
    expect(listStudySessionsForStudent(DEMO_STUDENT_ID)).toHaveLength(1);
    expect(listStudySessionsForStudent(DEMO_STUDENT_ID)[0]?.correctCount).toBe(36);
  });

  it("persists coach topic targets in mock mode", () => {
    const saved = upsertCoachTopicTargets("coach_001", DEMO_STUDENT_ID, {
      "Matematik:Problemler": 120,
      "Fizik:Hareket": -5,
    });

    expect(saved.targets["Matematik:Problemler"]).toBe(120);
    expect(saved.targets["Fizik:Hareket"]).toBe(0);
    expect(getCoachTopicTargets("coach_001", DEMO_STUDENT_ID)?.targets).toEqual(saved.targets);
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
