import type {
  CreateSubjectInput,
  CreateTopicInput,
  SubjectRecord,
  TopicExamType,
  TopicRecord,
  TopicTrackingSummary,
} from "@uyanik/database";
import { buildTopicSummary } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryTopics from "@/mocks/topics";

export type StudentTopicListResult = {
  subjects: SubjectRecord[];
  summary: TopicTrackingSummary;
};

async function listSubjectsForStudent(studentId: string): Promise<SubjectRecord[]> {
  if (shouldUseDatabase()) {
    const { topicRepository } = await import("@uyanik/database");
    return topicRepository.listSubjectsForStudent(studentId);
  }

  return memoryTopics.listSubjectsForStudent(studentId);
}

export async function listStudentTopics(studentId: string): Promise<StudentTopicListResult> {
  const subjects = await listSubjectsForStudent(studentId);
  const summary = buildTopicSummary(subjects);
  return { subjects, summary };
}

export async function createStudentSubject(
  input: CreateSubjectInput,
): Promise<SubjectRecord> {
  if (shouldUseDatabase()) {
    const { topicRepository } = await import("@uyanik/database");
    return topicRepository.createSubject(input);
  }

  return memoryTopics.createSubject(input);
}

export async function createStudentTopic(input: CreateTopicInput): Promise<TopicRecord | null> {
  if (shouldUseDatabase()) {
    const { topicRepository } = await import("@uyanik/database");
    return topicRepository.createTopic(input);
  }

  return memoryTopics.createTopic(input);
}

export async function updateStudentSubject(
  subjectId: string,
  studentId: string,
  data: { name?: string; examType?: TopicExamType },
): Promise<SubjectRecord | null> {
  if (shouldUseDatabase()) {
    const { topicRepository } = await import("@uyanik/database");
    return topicRepository.updateSubject(subjectId, studentId, data);
  }

  return memoryTopics.updateSubject(subjectId, studentId, data);
}

export async function updateStudentTopic(
  topicId: string,
  studentId: string,
  data: {
    name?: string;
    completed?: boolean;
    status?: "todo" | "progress" | "done";
    toggleSource?: string;
  },
): Promise<TopicRecord | null> {
  if (shouldUseDatabase()) {
    const { topicRepository } = await import("@uyanik/database");
    return topicRepository.updateTopic(topicId, studentId, data);
  }

  return memoryTopics.updateTopic(topicId, studentId, data);
}

export async function deleteStudentSubject(
  subjectId: string,
  studentId: string,
): Promise<boolean> {
  if (shouldUseDatabase()) {
    const { topicRepository } = await import("@uyanik/database");
    return topicRepository.deleteSubject(subjectId, studentId);
  }

  return memoryTopics.deleteSubject(subjectId, studentId);
}

export async function deleteStudentTopic(topicId: string, studentId: string): Promise<boolean> {
  if (shouldUseDatabase()) {
    const { topicRepository } = await import("@uyanik/database");
    return topicRepository.deleteTopic(topicId, studentId);
  }

  return memoryTopics.deleteTopic(topicId, studentId);
}
