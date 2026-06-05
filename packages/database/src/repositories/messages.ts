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
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Array<{
    id: string;
    threadId: string;
    senderRole: MessageRecord["senderRole"];
    body: string;
    createdAt: Date;
  }>;
}): MessageThreadRecord {
  return {
    id: thread.id,
    coachId: thread.coachId,
    studentId: thread.studentId,
    parentId: thread.parentId,
    title: thread.title,
    messages: thread.messages.map(mapMessage),
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
  };
}

export async function listThreadsForCoach(coachId: string): Promise<MessageThreadRecord[]> {
  const threads = await prisma.messageThread.findMany({
    where: { coachId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return threads.map(mapThread);
}

export async function listThreadsForStudent(studentId: string): Promise<MessageThreadRecord[]> {
  const threads = await prisma.messageThread.findMany({
    where: { studentId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return threads.map(mapThread);
}

export async function listThreadsForParent(parentId: string): Promise<MessageThreadRecord[]> {
  const threads = await prisma.messageThread.findMany({
    where: { parentId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return threads.map(mapThread);
}

export async function getThreadById(threadId: string): Promise<MessageThreadRecord | null> {
  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return thread ? mapThread(thread) : null;
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
