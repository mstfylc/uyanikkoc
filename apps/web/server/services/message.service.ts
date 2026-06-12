import type { MessageRecord, MessageThreadRecord } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryMessages from "@/mocks/messages";

const memoryThreadState = globalThis as typeof globalThis & {
  __uyanikThreadState?: Record<string, { lastReadAt?: string; muted?: boolean }>;
};
const threadState = memoryThreadState.__uyanikThreadState ?? (memoryThreadState.__uyanikThreadState = {});

function stateKey(threadId: string, userId: string): string {
  return `${threadId}:${userId}`;
}

function withMemoryState(threads: MessageThreadRecord[], userId?: string): MessageThreadRecord[] {
  if (!userId) return threads;
  return threads.map((thread) => {
    const state = threadState[stateKey(thread.id, userId)];
    const lastReadAt = state?.lastReadAt ?? null;
    return {
      ...thread,
      lastReadAt,
      muted: state?.muted ?? false,
      unreadCount: thread.messages.filter((message) => !lastReadAt || message.createdAt > lastReadAt).length,
    };
  });
}

export async function listCoachMessageThreads(coachId: string, userId?: string): Promise<MessageThreadRecord[]> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    return messageRepository.listThreadsForCoach(coachId, userId);
  }

  return withMemoryState(memoryMessages.listThreadsForCoach(coachId), userId);
}

export async function listStudentMessageThreads(
  studentId: string,
  userId?: string,
): Promise<MessageThreadRecord[]> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    return messageRepository.listThreadsForStudent(studentId, userId);
  }

  return withMemoryState(memoryMessages.listThreadsForStudent(studentId, userId), userId);
}

export async function listParentMessageThreads(
  parentId: string,
  userId?: string,
): Promise<MessageThreadRecord[]> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    return messageRepository.listThreadsForParent(parentId, userId);
  }

  return withMemoryState(memoryMessages.listThreadsForParent(parentId, userId), userId);
}

export async function getMessageThread(threadId: string, userId?: string): Promise<MessageThreadRecord | null> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    return messageRepository.getThreadById(threadId, userId);
  }

  const thread = memoryMessages.getThreadById(threadId);
  return thread ? withMemoryState([thread], userId)[0] ?? null : null;
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

export async function markMessageThreadRead(threadId: string, userId: string): Promise<void> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    await messageRepository.markThreadRead(threadId, userId);
    return;
  }

  threadState[stateKey(threadId, userId)] = {
    ...threadState[stateKey(threadId, userId)],
    lastReadAt: new Date().toISOString(),
  };
}

export async function setMessageThreadMuted(threadId: string, userId: string, muted: boolean): Promise<void> {
  if (shouldUseDatabase()) {
    const { messageRepository } = await import("@uyanik/database");
    await messageRepository.setThreadMuted(threadId, userId, muted);
    return;
  }

  threadState[stateKey(threadId, userId)] = {
    ...threadState[stateKey(threadId, userId)],
    muted,
  };
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
