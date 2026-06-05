import { prisma } from "../client";
import type { AssignmentRecord, NotificationRecord } from "../types";

function mapNotification(notification: {
  id: string;
  studentId: string | null;
  parentId: string | null;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}): NotificationRecord {
  return {
    id: notification.id,
    studentId: notification.studentId,
    parentId: notification.parentId,
    title: notification.title,
    body: notification.body,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
  };
}

function isOverdueAssignment(assignment: AssignmentRecord, now = new Date()): boolean {
  if (assignment.completed || assignment.status === "completed") {
    return false;
  }
  if (!assignment.dueDate) {
    return false;
  }
  return new Date(assignment.dueDate).getTime() < now.getTime();
}

export async function syncOverdueNotifications(
  studentId: string | null,
  parentId: string | null,
  assignments: AssignmentRecord[],
): Promise<void> {
  for (const assignment of assignments) {
    if (!isOverdueAssignment(assignment)) {
      continue;
    }

    const sourceKey = `overdue:${assignment.id}`;
    await prisma.notification.upsert({
      where: { sourceKey },
      update: {},
      create: {
        studentId,
        parentId,
        title: "Gecikmis odev",
        body: `"${assignment.title}" odevinin son tarihi gecti.`,
        sourceKey,
      },
    });
  }
}

export async function listNotificationsForStudent(studentId: string): Promise<NotificationRecord[]> {
  const notifications = await prisma.notification.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });

  return notifications.map(mapNotification);
}

export async function listNotificationsForParent(parentId: string): Promise<NotificationRecord[]> {
  const notifications = await prisma.notification.findMany({
    where: { parentId },
    orderBy: { createdAt: "desc" },
  });

  return notifications.map(mapNotification);
}

export async function markNotificationRead(
  notificationId: string,
  filter: { studentId?: string; parentId?: string },
): Promise<NotificationRecord | null> {
  const existing = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      studentId: filter.studentId,
      parentId: filter.parentId,
    },
  });

  if (!existing) {
    return null;
  }

  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return mapNotification(notification);
}

export function countUnread(notifications: NotificationRecord[]): number {
  return notifications.filter((item) => !item.read).length;
}
