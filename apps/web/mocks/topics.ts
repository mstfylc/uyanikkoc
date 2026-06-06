import type {
  CreateSubjectInput,
  CreateTopicInput,
  SubjectRecord,
  TopicExamType,
  TopicRecord,
  TopicTrackingSummary,
} from "@uyanik/database";
import { buildTopicSummary } from "@uyanik/database";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";

export { DEMO_STUDENT_ID };

const globalStore = globalThis as typeof globalThis & {
  __uyanikSubjects?: SubjectRecord[];
};

const subjects = globalStore.__uyanikSubjects ?? (globalStore.__uyanikSubjects = []);

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
}

export function resetTopicsForTests() {
  subjects.length = 0;
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
