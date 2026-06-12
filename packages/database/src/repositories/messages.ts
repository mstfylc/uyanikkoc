import { prisma } from "../client";
import type { MessageRecord, MessageThreadRecord } from "../types";

function mapMessage(message: {
  id: string;
  threadId: string;
  senderRole: MessageRecord["senderRole"];
  body: string;
  createdAt: Date;
}): MessageRecord {
  return {
    id: message.id,
    threadId: message.threadId,
    senderRole: message.senderRole,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
  };
}

function mapThread(thread: {
  id: string;
  coachId: string;
  studentId: string | null;
  parentId: string | null;
  kind?: "dm" | "group";
  name?: string | null;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  members?: Array<{ userId: string; lastReadAt?: Date | null; muted?: boolean }>;
  messages: Array<{
    id: string;
    threadId: string;
    senderRole: MessageRecord["senderRole"];
    body: string;
    createdAt: Date;
  }>;
}, viewerUserId?: string): MessageThreadRecord {
  const viewerMember = viewerUserId
    ? thread.members?.find((member) => member.userId === viewerUserId)
    : undefined;
  const lastReadAt = viewerMember?.lastReadAt ?? null;
  const unreadCount = viewerUserId
    ? thread.messages.filter((message) => !lastReadAt || message.createdAt > lastReadAt).length
    : undefined;

  return {
    id: thread.id,
    coachId: thread.coachId,
    studentId: thread.studentId,
    parentId: thread.parentId,
    kind: thread.kind ?? "dm",
    name: thread.name ?? null,
    memberUserIds: thread.members?.map((member) => member.userId),
    unreadCount,
    muted: viewerMember?.muted ?? false,
    lastReadAt: lastReadAt ? lastReadAt.toISOString() : null,
    title: thread.title,
    messages: thread.messages.map(mapMessage),
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
  };
}

export async function listThreadsForCoach(coachId: string, userId?: string): Promise<MessageThreadRecord[]> {
  const threads = await prisma.messageThread.findMany({
    where: { coachId },
    orderBy: { updatedAt: "desc" },
    include: {
      members: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return threads.map((thread) => mapThread(thread, userId));
}

export async function listThreadsForStudent(
  studentId: string,
  userId?: string,
): Promise<MessageThreadRecord[]> {
  const [dmThreads, groupIds] = await Promise.all([
    prisma.messageThread.findMany({
      where: { studentId, kind: "dm" },
      orderBy: { updatedAt: "desc" },
      include: { members: true, messages: { orderBy: { createdAt: "asc" } } },
    }),
    userId
      ? prisma.threadMember.findMany({ where: { userId }, select: { threadId: true } })
      : Promise.resolve([]),
  ]);

  const groupThreads =
    groupIds.length > 0
      ? await prisma.messageThread.findMany({
          where: { id: { in: groupIds.map((row) => row.threadId) } },
          include: { members: true, messages: { orderBy: { createdAt: "asc" } } },
        })
      : [];

  return [...dmThreads, ...groupThreads]
    .map((thread) => mapThread(thread, userId))
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

export async function listThreadsForParent(
  parentId: string,
  userId?: string,
): Promise<MessageThreadRecord[]> {
  const [dmThreads, groupIds] = await Promise.all([
    prisma.messageThread.findMany({
      where: { parentId, kind: "dm" },
      orderBy: { updatedAt: "desc" },
      include: { members: true, messages: { orderBy: { createdAt: "asc" } } },
    }),
    userId
      ? prisma.threadMember.findMany({ where: { userId }, select: { threadId: true } })
      : Promise.resolve([]),
  ]);

  const groupThreads =
    groupIds.length > 0
      ? await prisma.messageThread.findMany({
          where: { id: { in: groupIds.map((row) => row.threadId) } },
          include: { members: true, messages: { orderBy: { createdAt: "asc" } } },
        })
      : [];

  return [...dmThreads, ...groupThreads]
    .map((thread) => mapThread(thread, userId))
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

export async function getThreadById(threadId: string, userId?: string): Promise<MessageThreadRecord | null> {
  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: { members: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  return thread ? mapThread(thread, userId) : null;
}

export async function appendMessage(
  threadId: string,
  senderRole: MessageRecord["senderRole"],
  body: string,
): Promise<MessageRecord | null> {
  const thread = await prisma.messageThread.findUnique({ where: { id: threadId } });
  if (!thread) {
    return null;
  }

  const message = await prisma.message.create({
    data: {
      threadId,
      senderRole,
      body: body.trim(),
    },
  });

  await prisma.messageThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  return mapMessage(message);
}

export async function markThreadRead(threadId: string, userId: string): Promise<void> {
  await prisma.threadMember.upsert({
    where: { threadId_userId: { threadId, userId } },
    create: { threadId, userId, lastReadAt: new Date() },
    update: { lastReadAt: new Date() },
  });
}

export async function setThreadMuted(threadId: string, userId: string, muted: boolean): Promise<void> {
  await prisma.threadMember.upsert({
    where: { threadId_userId: { threadId, userId } },
    create: { threadId, userId, muted },
    update: { muted },
  });
}
