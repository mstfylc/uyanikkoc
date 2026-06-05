import type { MessageRecord, MessageThreadRecord } from "@uyanik/database";

import { DEMO_PARENT_ID, DEMO_STUDENT_ID } from "@/mocks/assignments";

export const DEMO_COACH_ID = "coach_001";

const globalStore = globalThis as typeof globalThis & {
  __uyanikMessageThreads?: MessageThreadRecord[];
};

const threads = globalStore.__uyanikMessageThreads ?? (globalStore.__uyanikMessageThreads = []);

function nowIso(): string {
  return new Date().toISOString();
}

function seedIfEmpty() {
  if (threads.length > 0) {
    return;
  }

  const timestamp = nowIso();
  const studentThreadId = "thread_coach_student_001";
  const parentThreadId = "thread_coach_parent_001";

  const studentMessages: MessageRecord[] = [
    {
      id: "msg_student_1",
      threadId: studentThreadId,
      senderRole: "COACH",
      body: "Merhaba! Bu haftaki matematik odevini unutma.",
      createdAt: timestamp,
    },
    {
      id: "msg_student_2",
      threadId: studentThreadId,
      senderRole: "STUDENT",
      body: "Tamam hocam, bugun bitirecegim.",
      createdAt: timestamp,
    },
  ];

  const parentMessages: MessageRecord[] = [
    {
      id: "msg_parent_1",
      threadId: parentThreadId,
      senderRole: "PARENT",
      body: "Cocugumun deneme sonuclari hakkinda bilgi alabilir miyim?",
      createdAt: timestamp,
    },
    {
      id: "msg_parent_2",
      threadId: parentThreadId,
      senderRole: "COACH",
      body: "Tabii, son TYT denemesinde net artisi var. Detaylari paylasacagim.",
      createdAt: timestamp,
    },
  ];

  threads.push(
    {
      id: studentThreadId,
      coachId: DEMO_COACH_ID,
      studentId: DEMO_STUDENT_ID,
      parentId: null,
      title: "Koç ile sohbet",
      messages: studentMessages,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: parentThreadId,
      coachId: DEMO_COACH_ID,
      studentId: null,
      parentId: DEMO_PARENT_ID,
      title: "Veli ile sohbet",
      messages: parentMessages,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  );
}

export function resetMessagesForTests(): void {
  threads.length = 0;
}

export function listThreadsForCoach(coachId: string): MessageThreadRecord[] {
  seedIfEmpty();
  return threads
    .filter((thread) => thread.coachId === coachId)
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

export function listThreadsForStudent(studentId: string): MessageThreadRecord[] {
  seedIfEmpty();
  return threads
    .filter((thread) => thread.studentId === studentId)
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

export function listThreadsForParent(parentId: string): MessageThreadRecord[] {
  seedIfEmpty();
  return threads
    .filter((thread) => thread.parentId === parentId)
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

export function getThreadById(threadId: string): MessageThreadRecord | null {
  seedIfEmpty();
  return threads.find((thread) => thread.id === threadId) ?? null;
}

export function appendMessage(
  threadId: string,
  senderRole: MessageRecord["senderRole"],
  body: string,
): MessageRecord | null {
  seedIfEmpty();
  const thread = threads.find((item) => item.id === threadId);
  if (!thread) {
    return null;
  }

  const timestamp = nowIso();
  const message: MessageRecord = {
    id: `msg_${Date.now()}`,
    threadId,
    senderRole,
    body: body.trim(),
    createdAt: timestamp,
  };

  thread.messages.push(message);
  thread.updatedAt = timestamp;
  return message;
}
