import type { MessageRecord, MessageThreadRecord } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryMessages from "@/mocks/messages";

export async function listCoachMessageThreads(coachId: string): Promise<MessageThreadRecord[]> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    return messageRepository.listThreadsForCoach(coachId);
  }

  return memoryMessages.listThreadsForCoach(coachId);
}

export async function listStudentMessageThreads(studentId: string): Promise<MessageThreadRecord[]> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    return messageRepository.listThreadsForStudent(studentId);
  }

  return memoryMessages.listThreadsForStudent(studentId);
}

export async function listParentMessageThreads(parentId: string): Promise<MessageThreadRecord[]> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    return messageRepository.listThreadsForParent(parentId);
  }

  return memoryMessages.listThreadsForParent(parentId);
}

export async function getMessageThread(threadId: string): Promise<MessageThreadRecord | null> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    return messageRepository.getThreadById(threadId);
  }

  return memoryMessages.getThreadById(threadId);
}

export async function appendThreadMessage(
  threadId: string,
  senderRole: MessageRecord["senderRole"],
  body: string,
): Promise<MessageRecord | null> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    return messageRepository.appendMessage(threadId, senderRole, body);
  }

  return memoryMessages.appendMessage(threadId, senderRole, body);
}

export function canAccessThread(
  thread: MessageThreadRecord,
  viewer: { coachId?: string | null; studentId?: string | null; parentId?: string | null },
): boolean {
  if (viewer.coachId && thread.coachId === viewer.coachId) {
    return true;
  }
  if (viewer.studentId && thread.studentId === viewer.studentId) {
    return true;
  }
  if (viewer.parentId && thread.parentId === viewer.parentId) {
    return true;
  }
  return false;
}
