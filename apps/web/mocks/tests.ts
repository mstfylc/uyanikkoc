import type { PsychTestDefinition, PsychTestQuestion, TestAssignmentRecord } from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";

export const LIKERT_OPTIONS = ["Hiç", "Az", "Orta", "Çok", "Tamamen"] as const;

function q(text: string): PsychTestQuestion {
  return { text, kind: "likert" };
}

export const TEST_CATALOG: PsychTestDefinition[] = [
  {
    id: "kaygi",
    name: "Sınav Kaygısı Ölçeği",
    icon: "ki-information-2",
    tone: "danger",
    description: "Sınav öncesi kaygı düzeyini ölçer.",
    questions: [
      q("Sınavdan önce kalbim hızlanır."),
      q("Bildiğim soruları bile sınavda unuturum."),
      q("Sınav gecesi uyumakta zorlanırım."),
      q("Sınav sırasında ellerim terler."),
      q("Sonuçları düşününce gerilirim."),
    ],
    bands: [
      [0, 2, "Düşük kaygı", "success"],
      [2, 3.2, "Orta kaygı", "warning"],
      [3.2, 5, "Yüksek kaygı", "danger"],
    ],
  },
  {
    id: "motivasyon",
    name: "Motivasyon Ölçeği",
    icon: "ki-flash",
    tone: "primary",
    description: "Çalışma motivasyonu ve hedef bağlılığı.",
    questions: [
      q("Hedeflerime ulaşacağıma inanıyorum."),
      q("Zorlandığımda pes etmem."),
      q("Çalışmaya başlamak benim için kolaydır."),
      q("Başarısızlık beni daha çok çalıştırır."),
      q("Geleceğim için heyecan duyuyorum."),
    ],
    bands: [
      [0, 2.5, "Düşük", "danger"],
      [2.5, 3.7, "Orta", "warning"],
      [3.7, 5, "Yüksek", "success"],
    ],
  },
  {
    id: "dikkat",
    name: "Dikkat & Odak Testi",
    icon: "ki-target",
    tone: "warning",
    description: "Çalışırken dikkat sürdürme düzeyi.",
    questions: [
      q("Çalışırken kolayca dikkatim dağılır."),
      q("Telefonum yanımdayken odaklanamam."),
      q("Uzun süre tek konuya çalışabilirim."),
      q("Mola sonrası toparlanmam uzun sürer."),
      q("Gürültülü ortamda çalışamam."),
    ],
    bands: [
      [0, 2.2, "Güçlü odak", "success"],
      [2.2, 3.4, "Orta", "warning"],
      [3.4, 5, "Dağınık", "danger"],
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
      studentName: "Demo Öğrenci",
      testId: "kaygi",
      status: "completed",
      score: 3.6,
      band: "Yüksek kaygı",
      bandTone: "danger",
      coachNote: "Nefes egzersizi önerildi.",
      sentAt: timestamp,
      completedAt: timestamp,
    },
    {
      id: "test_assign_002",
      coachId: "coach_001",
      studentId: DEMO_STUDENT_ID,
      studentName: "Demo Öğrenci",
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
      [0, 2.5, "Düşük", "danger"],
      [2.5, 3.7, "Orta", "warning"],
      [3.7, 5, "Yüksek", "success"],
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
