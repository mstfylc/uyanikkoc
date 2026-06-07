import { prisma } from "../client";
import type {
  PsychTestDefinition,
  PsychTestQuestion,
  TestAssignmentRecord,
  TestAssignmentStatus,
} from "../types";

type CustomTestBand = [number, number, string, string];

function mapAssignment(a: {
  id: string;
  coachId: string;
  studentId: string;
  studentName: string;
  testId: string;
  status: TestAssignmentStatus;
  score: number | null;
  band: string | null;
  bandTone: string | null;
  coachNote: string;
  sentAt: Date;
  completedAt: Date | null;
}): TestAssignmentRecord {
  return {
    id: a.id,
    coachId: a.coachId,
    studentId: a.studentId,
    studentName: a.studentName,
    testId: a.testId,
    status: a.status,
    score: a.score,
    band: a.band,
    bandTone: a.bandTone,
    coachNote: a.coachNote,
    sentAt: a.sentAt.toISOString(),
    completedAt: a.completedAt?.toISOString() ?? null,
  };
}

function mapCustomTest(t: {
  id: string;
  coachId: string;
  name: string;
  icon: string;
  tone: string;
  description: string;
  questions: unknown;
  bands: unknown;
}): PsychTestDefinition {
  return {
    id: t.id,
    name: t.name,
    icon: t.icon,
    tone: t.tone as PsychTestDefinition["tone"],
    description: t.description,
    questions: t.questions as PsychTestQuestion[],
    bands: t.bands as CustomTestBand[],
    custom: true,
    coachId: t.coachId,
  };
}

// --- Özel testler ---

export async function listCustomTests(): Promise<PsychTestDefinition[]> {
  const rows = await prisma.customPsychTest.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapCustomTest);
}

export async function getCustomTestById(testId: string): Promise<PsychTestDefinition | null> {
  const row = await prisma.customPsychTest.findUnique({ where: { id: testId } });
  return row ? mapCustomTest(row) : null;
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
  const bands: CustomTestBand[] = [
    [0, 2.5, "Dusuk", "danger"],
    [2.5, 3.7, "Orta", "warning"],
    [3.7, 5, "Yuksek", "success"],
  ];
  const row = await prisma.customPsychTest.create({
    data: {
      coachId,
      name: input.name,
      icon: input.icon,
      tone: input.tone,
      description: input.desc,
      questions: input.questions,
      bands,
    },
  });
  return mapCustomTest(row);
}

// --- Test atamaları ---

export async function listTestAssignmentsForCoach(coachId: string): Promise<TestAssignmentRecord[]> {
  const rows = await prisma.testAssignment.findMany({
    where: { coachId },
    orderBy: { sentAt: "desc" },
  });
  return rows.map(mapAssignment);
}

export async function listTestAssignmentsForStudent(
  studentId: string,
): Promise<TestAssignmentRecord[]> {
  const rows = await prisma.testAssignment.findMany({
    where: { studentId },
    orderBy: { sentAt: "desc" },
  });
  return rows.map(mapAssignment);
}

export async function findTestAssignmentById(id: string): Promise<TestAssignmentRecord | null> {
  const row = await prisma.testAssignment.findUnique({ where: { id } });
  return row ? mapAssignment(row) : null;
}

export async function sendTestAssignment(input: {
  coachId: string;
  studentId: string;
  studentName: string;
  testId: string;
}): Promise<TestAssignmentRecord> {
  const row = await prisma.testAssignment.create({
    data: {
      coachId: input.coachId,
      studentId: input.studentId,
      studentName: input.studentName,
      testId: input.testId,
    },
  });
  return mapAssignment(row);
}

export async function completeTestAssignment(
  id: string,
  score: number,
  band: string,
  bandTone: string,
): Promise<TestAssignmentRecord | null> {
  const existing = await prisma.testAssignment.findUnique({ where: { id } });
  if (!existing) return null;
  const row = await prisma.testAssignment.update({
    where: { id },
    data: { status: "completed", score, band, bandTone, completedAt: new Date() },
  });
  return mapAssignment(row);
}

export async function setTestCoachNote(
  id: string,
  coachNote: string,
): Promise<TestAssignmentRecord | null> {
  const existing = await prisma.testAssignment.findUnique({ where: { id } });
  if (!existing) return null;
  const row = await prisma.testAssignment.update({ where: { id }, data: { coachNote } });
  return mapAssignment(row);
}
