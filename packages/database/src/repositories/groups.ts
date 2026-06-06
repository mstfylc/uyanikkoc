import { prisma } from "../client";

export async function createGroup(coachId: string, name: string, memberUserIds: string[]): Promise<string> {
  const thread = await prisma.messageThread.create({
    data: {
      coachId,
      title: name,
      name,
      kind: "group",
      members: { create: memberUserIds.map((userId) => ({ userId })) },
    },
  });
  return thread.id;
}

export async function setGroupMembers(threadId: string, memberUserIds: string[]): Promise<void> {
  await prisma.$transaction([
    prisma.threadMember.deleteMany({ where: { threadId } }),
    prisma.threadMember.createMany({
      data: memberUserIds.map((userId) => ({ threadId, userId })),
    }),
  ]);
}

export async function listGroupThreadIdsForUser(userId: string): Promise<string[]> {
  const rows = await prisma.threadMember.findMany({
    where: { userId },
    select: { threadId: true },
  });
  return rows.map((row) => row.threadId);
}
