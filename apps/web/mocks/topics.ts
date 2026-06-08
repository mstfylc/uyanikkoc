import type {
  CoachTopicTargetsRecord,
  CreateSubjectInput,
  CreateTopicInput,
  SubjectRecord,
  TopicExamType,
  TopicRecord,
  TopicStudySessionRecord,
  TopicTrackingSummary,
  UpsertTopicStudySessionInput,
} from "@uyanik/database";
import { buildTopicSummary } from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";

export { DEMO_STUDENT_ID };

const globalStore = globalThis as typeof globalThis & {
  __uyanikSubjects?: SubjectRecord[];
  __uyanikTopicStudySessions?: TopicStudySessionRecord[];
  __uyanikCoachTopicTargets?: Record<string, CoachTopicTargetsRecord>;
};

const subjects = globalStore.__uyanikSubjects ?? (globalStore.__uyanikSubjects = []);
const studySessions =
  globalStore.__uyanikTopicStudySessions ?? (globalStore.__uyanikTopicStudySessions = []);
const coachTopicTargets =
  globalStore.__uyanikCoachTopicTargets ?? (globalStore.__uyanikCoachTopicTargets = {});

function nowIso(): string {
  return new Date().toISOString();
}

function emptyProgress(timestamp: string) {
  return {
    completed: false,
    completedAt: null as string | null,
    updatedAt: timestamp,
    completedSources: [] as string[],
  };
}

function daysBefore(days: number, hour = 12): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function seedDemoStudySessions(timestamp: string): void {
  if (studySessions.some((session) => session.studentId === DEMO_STUDENT_ID)) {
    return;
  }

  const topicMeta = new Map<string, { subjectName: string; topicName: string }>();
  for (const subject of subjects) {
    if (subject.studentId !== DEMO_STUDENT_ID) continue;
    for (const topic of subject.topics) {
      topicMeta.set(topic.id, { subjectName: subject.name, topicName: topic.name });
    }
  }

  const plans: Array<{ topicId: string; baseQuestion: number; baseCorrect: number; count: number; everyDays: number }> = [
    { topicId: "topic_mem_tyt_1", baseQuestion: 35, baseCorrect: 29, count: 12, everyDays: 6 },
    { topicId: "topic_mem_tyt_2", baseQuestion: 40, baseCorrect: 27, count: 12, everyDays: 7 },
    { topicId: "topic_mem_tur_1", baseQuestion: 30, baseCorrect: 25, count: 10, everyDays: 5 },
    { topicId: "topic_mem_tur_2", baseQuestion: 24, baseCorrect: 18, count: 8, everyDays: 8 },
    { topicId: "topic_mem_fen_1", baseQuestion: 25, baseCorrect: 17, count: 8, everyDays: 9 },
    { topicId: "topic_mem_fen_2", baseQuestion: 28, baseCorrect: 22, count: 9, everyDays: 6 },
  ];

  for (const plan of plans) {
    const meta = topicMeta.get(plan.topicId);
    if (!meta) continue;
    for (let index = 0; index < plan.count; index += 1) {
      const drift = index % 4;
      const questionCount = plan.baseQuestion + drift * 5;
      const correctCount = Math.min(questionCount, plan.baseCorrect + drift * 3 + Math.floor(index / 4));
      studySessions.push({
        id: `topic_session_demo_${plan.topicId}_${index + 1}`,
        topicId: plan.topicId,
        studentId: DEMO_STUDENT_ID,
        subjectName: meta.subjectName,
        topicName: meta.topicName,
        date: daysBefore((plan.count - index - 1) * plan.everyDays, 18),
        questionCount,
        correctCount,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  }
}

function seedIfEmpty() {
  if (subjects.length > 0) {
    return;
  }

  const timestamp = nowIso();
  subjects.push({
    id: "subject_mem_tyt_mat",
    studentId: DEMO_STUDENT_ID,
    examType: "TYT",
    name: "Matematik (ornek — silinebilir)",
    createdAt: timestamp,
    updatedAt: timestamp,
    topics: [
      {
        id: "topic_mem_tyt_1",
        subjectId: "subject_mem_tyt_mat",
        studentId: DEMO_STUDENT_ID,
        name: "Temel kavramlar (ornek)",
        progress: {
          completed: true,
          completedAt: timestamp,
          updatedAt: timestamp,
          completedSources: ["Mikro Mat"],
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "topic_mem_tyt_2",
        subjectId: "subject_mem_tyt_mat",
        studentId: DEMO_STUDENT_ID,
        name: "Problemler (ornek)",
        progress: emptyProgress(timestamp),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  });

  subjects.push(
    {
      id: "subject_mem_tyt_tur",
      studentId: DEMO_STUDENT_ID,
      examType: "TYT",
      name: "Turkce",
      createdAt: timestamp,
      updatedAt: timestamp,
      topics: [
        {
          id: "topic_mem_tur_1",
          subjectId: "subject_mem_tyt_tur",
          studentId: DEMO_STUDENT_ID,
          name: "Paragrafta anlam",
          progress: {
            completed: true,
            completedAt: timestamp,
            updatedAt: timestamp,
            completedSources: ["Limit Paragraf"],
          },
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        {
          id: "topic_mem_tur_2",
          subjectId: "subject_mem_tyt_tur",
          studentId: DEMO_STUDENT_ID,
          name: "Cumlede anlam",
          progress: { ...emptyProgress(timestamp), inProgress: true },
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        {
          id: "topic_mem_tur_3",
          subjectId: "subject_mem_tyt_tur",
          studentId: DEMO_STUDENT_ID,
          name: "Sozcukte anlam",
          progress: { ...emptyProgress(timestamp), inProgress: true },
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    },
    {
      id: "subject_mem_tyt_fen",
      studentId: DEMO_STUDENT_ID,
      examType: "TYT",
      name: "Fen Bilimleri",
      createdAt: timestamp,
      updatedAt: timestamp,
      topics: [
        {
          id: "topic_mem_fen_1",
          subjectId: "subject_mem_tyt_fen",
          studentId: DEMO_STUDENT_ID,
          name: "Hareket ve kuvvet",
          progress: { ...emptyProgress(timestamp), inProgress: true },
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        {
          id: "topic_mem_fen_2",
          subjectId: "subject_mem_tyt_fen",
          studentId: DEMO_STUDENT_ID,
          name: "Mol kavrami",
          progress: {
            completed: true,
            completedAt: timestamp,
            updatedAt: timestamp,
            completedSources: ["345 TYT Kimya"],
          },
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        {
          id: "topic_mem_fen_3",
          subjectId: "subject_mem_tyt_fen",
          studentId: DEMO_STUDENT_ID,
          name: "Canlilarin temel bilesenleri",
          progress: emptyProgress(timestamp),
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    },
  );

  seedDemoStudySessions(timestamp);
}

export function resetTopicsForTests() {
  subjects.length = 0;
  studySessions.length = 0;
  for (const key of Object.keys(coachTopicTargets)) {
    delete coachTopicTargets[key];
  }
}

function coachTargetKey(coachId: string, studentId: string): string {
  return `${coachId}:${studentId}`;
}

function normalizeTargets(targets: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(targets)) {
    if (key.length > 0) {
      out[key] = Math.max(0, Math.min(99999, Math.round(Number(value) || 0)));
    }
  }
  return out;
}

export function getCoachTopicTargets(
  coachId: string,
  studentId: string,
): CoachTopicTargetsRecord | null {
  return coachTopicTargets[coachTargetKey(coachId, studentId)] ?? null;
}

export function upsertCoachTopicTargets(
  coachId: string,
  studentId: string,
  targets: Record<string, number>,
): CoachTopicTargetsRecord {
  const record: CoachTopicTargetsRecord = {
    coachId,
    studentId,
    targets: normalizeTargets(targets),
    updatedAt: nowIso(),
  };
  coachTopicTargets[coachTargetKey(coachId, studentId)] = record;
  return record;
}

export function listSubjectsForStudent(studentId: string): SubjectRecord[] {
  seedIfEmpty();
  return subjects.filter((subject) => subject.studentId === studentId);
}

export function getTopicSummaryForStudent(studentId: string): TopicTrackingSummary {
  return buildTopicSummary(listSubjectsForStudent(studentId));
}

export function createSubject(input: CreateSubjectInput): SubjectRecord {
  const timestamp = nowIso();
  const subject: SubjectRecord = {
    id: `subject_${subjects.length + 1}`,
    studentId: input.studentId,
    examType: input.examType,
    name: input.name.trim(),
    topics: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  subjects.push(subject);
  return subject;
}

export function createTopic(input: CreateTopicInput): TopicRecord | null {
  const subject = subjects.find(
    (item) => item.id === input.subjectId && item.studentId === input.studentId,
  );

  if (!subject) {
    return null;
  }

  const timestamp = nowIso();
  const topic: TopicRecord = {
    id: `topic_${Date.now()}`,
    subjectId: input.subjectId,
    studentId: input.studentId,
    name: input.name.trim(),
    progress: emptyProgress(timestamp),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  subject.topics.push(topic);
  subject.updatedAt = timestamp;
  return topic;
}

export function updateSubject(
  subjectId: string,
  studentId: string,
  data: { name?: string; examType?: TopicExamType },
): SubjectRecord | null {
  const subject = subjects.find((item) => item.id === subjectId && item.studentId === studentId);
  if (!subject) {
    return null;
  }

  if (data.name) {
    subject.name = data.name.trim();
  }
  if (data.examType) {
    subject.examType = data.examType;
  }
  subject.updatedAt = nowIso();
  return subject;
}

export function updateTopic(
  topicId: string,
  studentId: string,
  data: {
    name?: string;
    completed?: boolean;
    status?: "todo" | "progress" | "done";
    toggleSource?: string;
  },
): TopicRecord | null {
  for (const subject of subjects) {
    const topic = subject.topics.find((item) => item.id === topicId && item.studentId === studentId);
    if (!topic) {
      continue;
    }

    const timestamp = nowIso();
    if (data.name) {
      topic.name = data.name.trim();
    }
    if (data.toggleSource) {
      const source = data.toggleSource.trim();
      const list = topic.progress.completedSources ?? (topic.progress.completedSources = []);
      const index = list.indexOf(source);
      if (index >= 0) {
        list.splice(index, 1);
      } else {
        list.push(source);
      }
      topic.progress.updatedAt = timestamp;
    }
    if (data.status) {
      if (data.status === "done") {
        topic.progress.completed = true;
        topic.progress.inProgress = false;
        topic.progress.completedAt = timestamp;
      } else if (data.status === "progress") {
        topic.progress.completed = false;
        topic.progress.inProgress = true;
        topic.progress.completedAt = null;
      } else {
        topic.progress.completed = false;
        topic.progress.inProgress = false;
        topic.progress.completedAt = null;
      }
      topic.progress.updatedAt = timestamp;
    } else if (data.completed !== undefined) {
      topic.progress.completed = data.completed;
      topic.progress.inProgress = false;
      topic.progress.completedAt = data.completed ? timestamp : null;
      topic.progress.updatedAt = timestamp;
    }
    topic.updatedAt = timestamp;
    subject.updatedAt = timestamp;
    return topic;
  }

  return null;
}

export function deleteSubject(subjectId: string, studentId: string): boolean {
  const index = subjects.findIndex(
    (item) => item.id === subjectId && item.studentId === studentId,
  );
  if (index === -1) {
    return false;
  }

  subjects.splice(index, 1);
  return true;
}

export function deleteTopic(topicId: string, studentId: string): boolean {
  for (const subject of subjects) {
    const index = subject.topics.findIndex(
      (item) => item.id === topicId && item.studentId === studentId,
    );
    if (index === -1) {
      continue;
    }

    subject.topics.splice(index, 1);
    subject.updatedAt = nowIso();
    return true;
  }

  return false;
}

function topicLookup(topicId: string, studentId: string) {
  for (const subject of subjects) {
    const topic = subject.topics.find((item) => item.id === topicId && item.studentId === studentId);
    if (topic) {
      return { subject, topic };
    }
  }
  return null;
}

export function listStudySessionsForStudent(studentId: string): TopicStudySessionRecord[] {
  seedIfEmpty();
  return studySessions
    .filter((item) => item.studentId === studentId)
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function upsertStudySession(
  input: UpsertTopicStudySessionInput,
): TopicStudySessionRecord | null {
  seedIfEmpty();
  const match = topicLookup(input.topicId, input.studentId);
  if (!match) {
    return null;
  }

  const timestamp = nowIso();
  const existingIndex = input.id
    ? studySessions.findIndex((item) => item.id === input.id && item.studentId === input.studentId)
    : -1;

  const record: TopicStudySessionRecord = {
    id: existingIndex >= 0 ? studySessions[existingIndex]!.id : `topic_session_${Date.now()}`,
    topicId: input.topicId,
    studentId: input.studentId,
    subjectName: match.subject.name,
    topicName: match.topic.name,
    date: new Date(input.date).toISOString(),
    questionCount: Math.max(0, Math.round(input.questionCount)),
    correctCount: Math.max(0, Math.round(input.correctCount)),
    createdAt: existingIndex >= 0 ? studySessions[existingIndex]!.createdAt : timestamp,
    updatedAt: timestamp,
  };

  if (existingIndex >= 0) {
    studySessions[existingIndex] = record;
  } else {
    studySessions.push(record);
  }

  return record;
}
