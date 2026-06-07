import { prisma } from "../client";
import type {
  CreateSubjectInput,
  CreateTopicInput,
  SubjectRecord,
  TopicExamType,
  TopicProgressRecord,
  TopicRecord,
  TopicTrackingSummary,
} from "../types";

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
