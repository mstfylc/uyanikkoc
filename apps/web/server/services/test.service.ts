import type { PsychTestDefinition, PsychTestQuestion, TestAssignmentRecord } from "@uyanik/database";
import { answerScore, averageScore } from "@uyanik/shared";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryTests from "@/mocks/tests";

export { LIKERT_OPTIONS, TEST_CATALOG } from "@/mocks/tests";

async function repo() {
  const { testRepository } = await import("@uyanik/database");
  return testRepository;
}

export async function listPsychTests(): Promise<PsychTestDefinition[]> {
  if (shouldUseDatabase()) {
    const custom = await (await repo()).listCustomTests();
    return [...custom, ...memoryTests.TEST_CATALOG];
  }
  return memoryTests.TEST_CATALOG;
}

export async function getPsychTestById(testId: string): Promise<PsychTestDefinition | undefined> {
  const catalogHit = memoryTests.getTestById(testId);
  if (catalogHit) return catalogHit;
  if (shouldUseDatabase()) {
    return (await (await repo()).getCustomTestById(testId)) ?? undefined;
  }
  return undefined;
}

export async function listCoachTestAssignments(coachId: string): Promise<TestAssignmentRecord[]> {
  if (shouldUseDatabase()) return (await repo()).listTestAssignmentsForCoach(coachId);
  return memoryTests.listTestAssignmentsForCoach(coachId);
}

export async function listStudentTestAssignments(
  studentId: string,
): Promise<TestAssignmentRecord[]> {
  if (shouldUseDatabase()) return (await repo()).listTestAssignmentsForStudent(studentId);
  return memoryTests.listTestAssignmentsForStudent(studentId);
}

export async function sendCoachTest(input: {
  coachId: string;
  studentId: string;
  studentName: string;
  testId: string;
}): Promise<TestAssignmentRecord> {
  if (shouldUseDatabase()) return (await repo()).sendTestAssignment(input);
  return memoryTests.sendTestAssignment(input);
}

export async function completeStudentTest(
  assignmentId: string,
  studentId: string,
  answers: number[],
): Promise<TestAssignmentRecord | null> {
  const assignments = await listStudentTestAssignments(studentId);
  const assignment = assignments.find((item) => item.id === assignmentId);
  if (!assignment || assignment.status === "completed") {
    return null;
  }

  const test = await getPsychTestById(assignment.testId);
  if (!test) {
    return null;
  }

  const score = averageScore(
    test.questions.map((question, index) => answerScore(question.kind, answers[index] ?? null, question)),
  );
  const band = memoryTests.scoreBand(test, score);

  if (shouldUseDatabase()) {
    return (await repo()).completeTestAssignment(assignmentId, score, band.label, band.tone);
  }
  return memoryTests.completeTestAssignment(assignmentId, score, band.label, band.tone);
}

export async function createCustomTest(
  coachId: string,
  input: {
    name: string;
    desc: string;
    icon: string;
    tone: PsychTestDefinition["tone"];
    questions: PsychTestQuestion[];
  },
): Promise<PsychTestDefinition> {
  if (shouldUseDatabase()) return (await repo()).createCustomTest(coachId, input);
  return memoryTests.createCustomTest(coachId, input);
}

export async function setCoachTestNote(
  coachId: string,
  assignmentId: string,
  coachNote: string,
): Promise<TestAssignmentRecord | null> {
  if (shouldUseDatabase()) {
    const r = await repo();
    const assignment = await r.findTestAssignmentById(assignmentId);
    if (!assignment || assignment.coachId !== coachId) {
      return null;
    }
    return r.setTestCoachNote(assignmentId, coachNote);
  }
  const assignments = memoryTests.listTestAssignmentsForCoach(coachId);
  if (!assignments.some((item) => item.id === assignmentId)) {
    return null;
  }
  return memoryTests.setTestCoachNote(assignmentId, coachNote);
}
