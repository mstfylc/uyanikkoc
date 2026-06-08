import { prisma } from "../client";
import type {
  CreateSubjectInput,
  CreateTopicInput,
  CoachTopicTargetsRecord,
  SubjectRecord,
  TopicExamType,
  TopicProgressRecord,
  TopicRecord,
  TopicStudySessionRecord,
  TopicTrackingSummary,
  UpsertTopicStudySessionInput,
} from "../types";

function normalizeTargets(targets: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(targets)) {
    if (key.length > 0) {
      out[key] = Math.max(0, Math.min(99999, Math.round(Number(value) || 0)));
    }
  }
  return out;
}

function mapTargets(row: {
  coachId: string;
  studentId: string;
  targets: unknown;
  updatedAt: Date;
}): CoachTopicTargetsRecord {
  const raw = row.targets && typeof row.targets === "object" ? row.targets : {};
  return {
    coachId: row.coachId,
    studentId: row.studentId,
    targets: normalizeTargets(raw as Record<string, number>),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapProgress(progress: {
  completed: boolean;
  inProgress: boolean;
  completedSources: string[];
  completedAt: Date | null;
  updatedAt: Date;
}): TopicProgressRecord {
  return {
    completed: progress.completed,
    inProgress: progress.inProgress,
    completedSources: progress.completedSources,
    completedAt: progress.completedAt?.toISOString() ?? null,
    updatedAt: progress.updatedAt.toISOString(),
  };
}

function mapTopic(topic: {
  id: string;
  subjectId: string;
  studentId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  progress: {
    completed: boolean;
    inProgress: boolean;
    completedSources: string[];
    completedAt: Date | null;
    updatedAt: Date;
  } | null;
}): TopicRecord {
  const progress = topic.progress ?? {
    completed: false,
    inProgress: false,
    completedSources: [],
    completedAt: null,
    updatedAt: topic.updatedAt,
  };

  return {
    id: topic.id,
    subjectId: topic.subjectId,
    studentId: topic.studentId,
    name: topic.name,
    progress: mapProgress(progress),
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
  };
}

function mapStudySession(session: {
  id: string;
  topicId: string;
  studentId: string;
  date: Date;
  questionCount: number;
  correctCount: number;
  createdAt: Date;
  updatedAt: Date;
  topic: {
    name: string;
    subject: { name: string };
  };
}): TopicStudySessionRecord {
  return {
    id: session.id,
    topicId: session.topicId,
    studentId: session.studentId,
    subjectName: session.topic.subject.name,
    topicName: session.topic.name,
    date: session.date.toISOString(),
    questionCount: session.questionCount,
    correctCount: session.correctCount,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

function mapSubject(subject: {
  id: string;
  studentId: string;
  examType: TopicExamType;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  topics: Array<{
    id: string;
    subjectId: string;
    studentId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    progress: {
      completed: boolean;
      inProgress: boolean;
      completedSources: string[];
      completedAt: Date | null;
      updatedAt: Date;
    } | null;
  }>;
}): SubjectRecord {
  return {
    id: subject.id,
    studentId: subject.studentId,
    examType: subject.examType,
    name: subject.name,
    topics: subject.topics.map(mapTopic),
    createdAt: subject.createdAt.toISOString(),
    updatedAt: subject.updatedAt.toISOString(),
  };
}

export function buildTopicSummary(subjects: SubjectRecord[]): TopicTrackingSummary {
  const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
  const completedTopics = subjects.reduce(
    (sum, subject) => sum + subject.topics.filter((topic) => topic.progress.completed).length,
    0,
  );
  const completionRate =
    totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  return { totalTopics, completedTopics, completionRate };
}

export async function listSubjectsForStudent(studentId: string): Promise<SubjectRecord[]> {
  const subjects = await prisma.subject.findMany({
    where: { studentId },
    orderBy: { createdAt: "asc" },
    include: {
      topics: {
        orderBy: { createdAt: "asc" },
        include: { progress: true },
      },
    },
  });

  return subjects.map(mapSubject);
}

export async function createSubject(input: CreateSubjectInput): Promise<SubjectRecord> {
  const subject = await prisma.subject.create({
    data: {
      studentId: input.studentId,
      examType: input.examType,
      name: input.name.trim(),
    },
    include: { topics: { include: { progress: true } } },
  });

  return mapSubject(subject);
}

export async function createTopic(input: CreateTopicInput): Promise<TopicRecord | null> {
  const subject = await prisma.subject.findFirst({
    where: { id: input.subjectId, studentId: input.studentId },
  });

  if (!subject) {
    return null;
  }

  const topic = await prisma.topic.create({
    data: {
      subjectId: input.subjectId,
      studentId: input.studentId,
      name: input.name.trim(),
      progress: {
        create: {
          studentId: input.studentId,
        },
      },
    },
    include: { progress: true },
  });

  return mapTopic(topic);
}

export async function updateSubject(
  subjectId: string,
  studentId: string,
  data: { name?: string; examType?: TopicExamType },
): Promise<SubjectRecord | null> {
  const existing = await prisma.subject.findFirst({
    where: { id: subjectId, studentId },
  });

  if (!existing) {
    return null;
  }

  const subject = await prisma.subject.update({
    where: { id: subjectId },
    data: {
      name: data.name?.trim() ?? undefined,
      examType: data.examType ?? undefined,
    },
    include: {
      topics: {
        orderBy: { createdAt: "asc" },
        include: { progress: true },
      },
    },
  });

  return mapSubject(subject);
}

export async function updateTopic(
  topicId: string,
  studentId: string,
  data: {
    name?: string;
    completed?: boolean;
    status?: "todo" | "progress" | "done";
    toggleSource?: string;
  },
): Promise<TopicRecord | null> {
  const existing = await prisma.topic.findFirst({
    where: { id: topicId, studentId },
    include: { progress: true },
  });

  if (!existing) {
    return null;
  }

  const timestamp = new Date();
  const current = existing.progress;

  // Mevcut ilerleme durumundan başla, gelen alana göre güncelle (mock ile aynı mantık).
  let completed = current?.completed ?? false;
  let inProgress = current?.inProgress ?? false;
  let completedAt = current?.completedAt ?? null;
  let completedSources = current?.completedSources ?? [];

  if (data.toggleSource) {
    const source = data.toggleSource.trim();
    completedSources = completedSources.includes(source)
      ? completedSources.filter((item) => item !== source)
      : [...completedSources, source];
  }

  if (data.status === "done") {
    completed = true;
    inProgress = false;
    completedAt = timestamp;
  } else if (data.status === "progress") {
    completed = false;
    inProgress = true;
    completedAt = null;
  } else if (data.status === "todo") {
    completed = false;
    inProgress = false;
    completedAt = null;
  } else if (data.completed !== undefined) {
    completed = data.completed;
    inProgress = false;
    completedAt = data.completed ? timestamp : null;
  }

  const topic = await prisma.topic.update({
    where: { id: topicId },
    data: {
      name: data.name?.trim() ?? undefined,
      progress: {
        upsert: {
          create: { studentId, completed, inProgress, completedAt, completedSources },
          update: { completed, inProgress, completedAt, completedSources, updatedAt: timestamp },
        },
      },
    },
    include: { progress: true },
  });

  return mapTopic(topic);
}

export async function deleteSubject(subjectId: string, studentId: string): Promise<boolean> {
  const existing = await prisma.subject.findFirst({
    where: { id: subjectId, studentId },
  });

  if (!existing) {
    return false;
  }

  await prisma.subject.delete({ where: { id: subjectId } });
  return true;
}

export async function deleteTopic(topicId: string, studentId: string): Promise<boolean> {
  const existing = await prisma.topic.findFirst({
    where: { id: topicId, studentId },
  });

  if (!existing) {
    return false;
  }

  await prisma.topic.delete({ where: { id: topicId } });
  return true;
}

export async function getCoachTopicTargets(
  coachId: string,
  studentId: string,
): Promise<CoachTopicTargetsRecord | null> {
  const row = await prisma.coachTopicTarget.findUnique({
    where: { coachId_studentId: { coachId, studentId } },
  });
  return row ? mapTargets(row) : null;
}

export async function upsertCoachTopicTargets(
  coachId: string,
  studentId: string,
  targets: Record<string, number>,
): Promise<CoachTopicTargetsRecord> {
  const normalized = normalizeTargets(targets);
  const row = await prisma.coachTopicTarget.upsert({
    where: { coachId_studentId: { coachId, studentId } },
    create: { coachId, studentId, targets: normalized },
    update: { targets: normalized },
  });
  return mapTargets(row);
}

export async function listStudySessionsForStudent(
  studentId: string,
): Promise<TopicStudySessionRecord[]> {
  const sessions = await prisma.topicStudySession.findMany({
    where: { studentId },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    include: { topic: { include: { subject: true } } },
  });

  return sessions.map(mapStudySession);
}

export async function upsertStudySession(
  input: UpsertTopicStudySessionInput,
): Promise<TopicStudySessionRecord | null> {
  const topic = await prisma.topic.findFirst({
    where: { id: input.topicId, studentId: input.studentId },
  });
  if (!topic) {
    return null;
  }

  const date = new Date(input.date);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const data = {
    topicId: input.topicId,
    studentId: input.studentId,
    date,
    questionCount: Math.max(0, Math.round(input.questionCount)),
    correctCount: Math.max(0, Math.round(input.correctCount)),
  };

  if (input.id) {
    const existing = await prisma.topicStudySession.findFirst({
      where: { id: input.id, studentId: input.studentId },
      select: { id: true },
    });
    if (!existing) {
      return null;
    }
  }

  const session = input.id
    ? await prisma.topicStudySession.update({
        where: { id: input.id },
        data,
        include: { topic: { include: { subject: true } } },
      })
    : await prisma.topicStudySession.create({
        data,
        include: { topic: { include: { subject: true } } },
      });

  return mapStudySession(session);
}
