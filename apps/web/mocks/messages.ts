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
  const groupThreadId = "thread_group_demo_001";

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
    {
      id: "msg_student_3",
      threadId: studentThreadId,
      senderRole: "COACH",
      body: "Bitirince sonuc gir; dogru/yanlis uzerinden yarin programi ayarlayacagim.",
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
    {
      id: "msg_parent_3",
      threadId: parentThreadId,
      senderRole: "COACH",
      body: "Bu hafta raporu onayladim; Gelisim Raporlari ekraninda gorebilirsiniz.",
      createdAt: timestamp,
    },
  ];

  const groupMessages: MessageRecord[] = [
    {
      id: "msg_group_1",
      threadId: groupThreadId,
      senderRole: "COACH",
      body: "TYT kamp grubu: Her gun 20 paragraf + 20 problem hedefini isaretleyin.",
      createdAt: timestamp,
    },
    {
      id: "msg_group_2",
      threadId: groupThreadId,
      senderRole: "STUDENT",
      body: "Hocam bugunku problem setini tamamladim.",
      createdAt: timestamp,
    },
  ];

  threads.push(
    {
      id: studentThreadId,
      coachId: DEMO_COACH_ID,
      studentId: DEMO_STUDENT_ID,
      parentId: null,
      kind: "dm",
      name: null,
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
      kind: "dm",
      name: null,
      title: "Veli ile sohbet",
      messages: parentMessages,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: groupThreadId,
      coachId: DEMO_COACH_ID,
      studentId: null,
      parentId: null,
      kind: "group",
      name: "TYT Kamp Grubu",
      title: "TYT Kamp Grubu",
      memberUserIds: ["user_student_001", "user_student_002", "user_parent_001"],
      messages: groupMessages,
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

export function listThreadsForStudent(studentId: string, userId?: string): MessageThreadRecord[] {
  seedIfEmpty();
  const dms = threads.filter((thread) => thread.studentId === studentId && (thread.kind ?? "dm") === "dm");
  const groups = userId
    ? threads.filter(
        (thread) =>
          thread.kind === "group" && (thread.memberUserIds ?? []).includes(userId),
      )
    : [];
  return [...dms, ...groups].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

export function listThreadsForParent(parentId: string, userId?: string): MessageThreadRecord[] {
  seedIfEmpty();
  const dms = threads.filter((thread) => thread.parentId === parentId && (thread.kind ?? "dm") === "dm");
  const groups = userId
    ? threads.filter(
        (thread) =>
          thread.kind === "group" && (thread.memberUserIds ?? []).includes(userId),
      )
    : [];
  return [...dms, ...groups].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

export function createGroup(coachId: string, name: string, memberUserIds: string[]): string {
  seedIfEmpty();
  const timestamp = nowIso();
  const id = `thread_group_${Date.now()}`;
  threads.unshift({
    id,
    coachId,
    studentId: null,
    parentId: null,
    kind: "group",
    name,
    title: name,
    memberUserIds,
    messages: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return id;
}

export function setGroupMembers(threadId: string, memberUserIds: string[]): boolean {
  seedIfEmpty();
  const thread = threads.find((item) => item.id === threadId && item.kind === "group");
  if (!thread) return false;
  thread.memberUserIds = memberUserIds;
  thread.updatedAt = nowIso();
  return true;
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
