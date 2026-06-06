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

export async function listStudentMessageThreads(
  studentId: string,
  userId?: string,
): Promise<MessageThreadRecord[]> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    return messageRepository.listThreadsForStudent(studentId, userId);
  }

  return memoryMessages.listThreadsForStudent(studentId, userId);
}

export async function listParentMessageThreads(
  parentId: string,
  userId?: string,
): Promise<MessageThreadRecord[]> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    return messageRepository.listThreadsForParent(parentId, userId);
  }

  return memoryMessages.listThreadsForParent(parentId, userId);
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

export async function createGroupThread(
  coachId: string,
  name: string,
  memberUserIds: string[],
): Promise<string> {
  if (shouldUseDatabase()) {
    const { groupRepository } = await import("@uyanik/database");
    return groupRepository.createGroup(coachId, name, memberUserIds);
  }

  return memoryMessages.createGroup(coachId, name, memberUserIds);
}

export async function updateGroupMembers(threadId: string, memberUserIds: string[]): Promise<void> {
  if (shouldUseDatabase()) {
    const { groupRepository } = await import("@uyanik/database");
    await groupRepository.setGroupMembers(threadId, memberUserIds);
    return;
  }

  if (!memoryMessages.setGroupMembers(threadId, memberUserIds)) {
    throw new Error("Group not found");
  }
}

export function canAccessThread(
  thread: MessageThreadRecord,
  viewer: {
    userId?: string;
    coachId?: string | null;
    studentId?: string | null;
    parentId?: string | null;
  },
): boolean {
  if (viewer.coachId && thread.coachId === viewer.coachId) {
    return true;
  }
  if (thread.kind === "group") {
    return Boolean(viewer.userId && (thread.memberUserIds ?? []).includes(viewer.userId));
  }
  if (viewer.studentId && thread.studentId === viewer.studentId) {
    return true;
  }
  if (viewer.parentId && thread.parentId === viewer.parentId) {
    return true;
  }
  return false;
}
