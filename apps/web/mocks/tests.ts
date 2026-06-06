import type { PsychTestDefinition, PsychTestQuestion, TestAssignmentRecord } from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";

export const LIKERT_OPTIONS = ["Hic", "Az", "Orta", "Cok", "Tamamen"] as const;

function q(text: string): PsychTestQuestion {
  return { text, kind: "likert" };
}

export const TEST_CATALOG: PsychTestDefinition[] = [
  {
    id: "kaygi",
    name: "Sinav Kaygisi Olcegi",
    icon: "ki-information-2",
    tone: "danger",
    description: "Sinav oncesi kaygi duzeyini olcer.",
    questions: [
      q("Sinavdan once kalbim hizlanir."),
      q("Bildigim sorulari bile sinavda unuturum."),
      q("Sinav gecesi uyumakta zorlanirim."),
      q("Sinav sirasinda ellerim terler."),
      q("Sonuclari dusununce gerilirim."),
    ],
    bands: [
      [0, 2, "Dusuk kaygi", "success"],
      [2, 3.2, "Orta kaygi", "warning"],
      [3.2, 5, "Yuksek kaygi", "danger"],
    ],
  },
  {
    id: "motivasyon",
    name: "Motivasyon Olcegi",
    icon: "ki-flash",
    tone: "primary",
    description: "Calisma motivasyonu ve hedef bagliligi.",
    questions: [
      q("Hedeflerime ulasacagima inaniyorum."),
      q("Zorlandigimda pes etmem."),
      q("Calismaya baslamak benim icin kolaydir."),
      q("Basarisizlik beni daha cok calistirir."),
      q("Gelecegim icin heyecan duyuyorum."),
    ],
    bands: [
      [0, 2.5, "Dusuk", "danger"],
      [2.5, 3.7, "Orta", "warning"],
      [3.7, 5, "Yuksek", "success"],
    ],
  },
  {
    id: "dikkat",
    name: "Dikkat & Odak Testi",
    icon: "ki-target",
    tone: "warning",
    description: "Calisirken dikkat surdurme duzeyi.",
    questions: [
      q("Calisirken kolayca dikkatim dagilir."),
      q("Telefonum yanimdayken odaklanamam."),
      q("Uzun sure tek konuya calisabilirim."),
      q("Mola sonrasi toparlanmam uzun surer."),
      q("Gurultulu ortamda calisamam."),
    ],
    bands: [
      [0, 2.2, "Guclu odak", "success"],
      [2.2, 3.4, "Orta", "warning"],
      [3.4, 5, "Daginik", "danger"],
    ],
  },
];

const globalStore = globalThis as typeof globalThis & {
  __uyanikTestAssignments?: TestAssignmentRecord[];
};

const assignments = globalStore.__uyanikTestAssignments ?? (globalStore.__uyanikTestAssignments = []);

function nowIso(): string {
  return new Date().toISOString();
}

function seedIfEmpty() {
  if (assignments.length > 0) {
    return;
  }

  const timestamp = nowIso();
  assignments.push(
    {
      id: "test_assign_001",
      coachId: "coach_001",
      studentId: DEMO_STUDENT_ID,
      studentName: "Demo Ogrenci",
      testId: "kaygi",
      status: "completed",
      score: 3.6,
      band: "Yuksek kaygi",
      bandTone: "danger",
      coachNote: "Nefes egzersizi onerildi.",
      sentAt: timestamp,
      completedAt: timestamp,
    },
    {
      id: "test_assign_002",
      coachId: "coach_001",
      studentId: DEMO_STUDENT_ID,
      studentName: "Demo Ogrenci",
      testId: "motivasyon",
      status: "sent",
      score: null,
      band: null,
      bandTone: null,
      coachNote: "",
      sentAt: timestamp,
      completedAt: null,
    },
  );
}

export function getTestById(testId: string): PsychTestDefinition | undefined {
  return TEST_CATALOG.find((item) => item.id === testId);
}

export function createCustomTest(
  coachId: string,
  input: {
    name: string;
    desc: string;
    icon: string;
    tone: PsychTestDefinition["tone"];
    questions: PsychTestQuestion[];
  },
): PsychTestDefinition {
  const test: PsychTestDefinition = {
    id: `custom_${Date.now()}`,
    name: input.name,
    icon: input.icon,
    tone: input.tone,
    description: input.desc,
    questions: input.questions,
    bands: [
      [0, 2.5, "Dusuk", "danger"],
      [2.5, 3.7, "Orta", "warning"],
      [3.7, 5, "Yuksek", "success"],
    ],
    custom: true,
    coachId,
  };
  TEST_CATALOG.unshift(test);
  return test;
}

export function scoreBand(test: PsychTestDefinition, score: number): { label: string; tone: string } {
  for (const [lo, hi, label, tone] of test.bands) {
    if (score >= lo && score <= hi) {
      return { label, tone };
    }
  }
  return { label: "—", tone: "muted" };
}

export function listTestAssignmentsForCoach(coachId: string): TestAssignmentRecord[] {
  seedIfEmpty();
  return assignments.filter((item) => item.coachId === coachId);
}

export function listTestAssignmentsForStudent(studentId: string): TestAssignmentRecord[] {
  seedIfEmpty();
  return assignments.filter((item) => item.studentId === studentId);
}

export function sendTestAssignment(input: {
  coachId: string;
  studentId: string;
  studentName: string;
  testId: string;
}): TestAssignmentRecord {
  seedIfEmpty();
  const record: TestAssignmentRecord = {
    id: `test_assign_${Date.now()}`,
    coachId: input.coachId,
    studentId: input.studentId,
    studentName: input.studentName,
    testId: input.testId,
    status: "sent",
    score: null,
    band: null,
    bandTone: null,
    coachNote: "",
    sentAt: nowIso(),
    completedAt: null,
  };
  assignments.unshift(record);
  return record;
}

export function completeTestAssignment(
  id: string,
  score: number,
  band: string,
  bandTone: string,
): TestAssignmentRecord | null {
  seedIfEmpty();
  const index = assignments.findIndex((item) => item.id === id);
  if (index < 0) {
    return null;
  }
  assignments[index] = {
    ...assignments[index],
    status: "completed",
    score,
    band,
    bandTone,
    completedAt: nowIso(),
  };
  return assignments[index];
}

export function setTestCoachNote(id: string, coachNote: string): TestAssignmentRecord | null {
  seedIfEmpty();
  const index = assignments.findIndex((item) => item.id === id);
  if (index < 0) {
    return null;
  }
  assignments[index] = { ...assignments[index], coachNote };
  return assignments[index];
}
