import type { PsychTestDefinition, PsychTestQuestion, TestAssignmentRecord } from "@uyanik/database";
import { answerScore, averageScore } from "@uyanik/shared";

import * as memoryTests from "@/mocks/tests";

export { LIKERT_OPTIONS, TEST_CATALOG } from "@/mocks/tests";

export async function listPsychTests(): Promise<PsychTestDefinition[]> {
  return memoryTests.TEST_CATALOG;
}

export async function listCoachTestAssignments(coachId: string): Promise<TestAssignmentRecord[]> {
  return memoryTests.listTestAssignmentsForCoach(coachId);
}

export async function listStudentTestAssignments(studentId: string): Promise<TestAssignmentRecord[]> {
  return memoryTests.listTestAssignmentsForStudent(studentId);
}

export async function sendCoachTest(input: {
  coachId: string;
  studentId: string;
  studentName: string;
  testId: string;
}): Promise<TestAssignmentRecord> {
  return memoryTests.sendTestAssignment(input);
}

export async function completeStudentTest(
  assignmentId: string,
  studentId: string,
  answers: number[],
): Promise<TestAssignmentRecord | null> {
  const assignments = memoryTests.listTestAssignmentsForStudent(studentId);
  const assignment = assignments.find((item) => item.id === assignmentId);
  if (!assignment || assignment.status === "completed") {
    return null;
  }

  const test = memoryTests.getTestById(assignment.testId);
  if (!test) {
    return null;
  }

  const score = averageScore(
    test.questions.map((question, index) => answerScore(question.kind, answers[index] ?? null, question)),
  );
  const band = memoryTests.scoreBand(test, score);

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
  return memoryTests.createCustomTest(coachId, input);
}

export async function setCoachTestNote(
  coachId: string,
  assignmentId: string,
  coachNote: string,
): Promise<TestAssignmentRecord | null> {
  const assignments = memoryTests.listTestAssignmentsForCoach(coachId);
  if (!assignments.some((item) => item.id === assignmentId)) {
    return null;
  }
  return memoryTests.setTestCoachNote(assignmentId, coachNote);
}

export function getPsychTestById(testId: string): PsychTestDefinition | undefined {
  return memoryTests.getTestById(testId);
}
