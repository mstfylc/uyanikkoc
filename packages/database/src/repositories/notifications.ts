import { prisma } from "../client";
import type { AssignmentRecord, NotificationRecord } from "../types";

function mapNotification(notification: {
  id: string;
  studentId: string | null;
  parentId: string | null;
  coachId: string | null;
  icon: string | null;
  tone: string | null;
  title: string;
  body: string;
  page: string | null;
  read: boolean;
  createdAt: Date;
}): NotificationRecord {
  return {
    id: notification.id,
    studentId: notification.studentId,
    parentId: notification.parentId,
    coachId: notification.coachId,
    icon: notification.icon,
    tone: notification.tone,
    title: notification.title,
    body: notification.body,
    page: notification.page,
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
        icon: "clock",
        tone: "warning",
        page: "assignments",
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

export async function listNotificationsForCoach(coachId: string): Promise<NotificationRecord[]> {
  const notifications = await prisma.notification.findMany({
    where: { coachId },
    orderBy: { createdAt: "desc" },
  });

  return notifications.map(mapNotification);
}

export async function markNotificationRead(
  notificationId: string,
  filter: { studentId?: string; parentId?: string; coachId?: string },
): Promise<NotificationRecord | null> {
  const existing = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      studentId: filter.studentId,
      parentId: filter.parentId,
      coachId: filter.coachId,
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

export async function markAllNotificationsRead(filter: {
  studentId?: string;
  parentId?: string;
  coachId?: string;
}): Promise<number> {
  if (!filter.studentId && !filter.parentId && !filter.coachId) {
    return 0;
  }

  const result = await prisma.notification.updateMany({
    where: {
      studentId: filter.studentId,
      parentId: filter.parentId,
      coachId: filter.coachId,
      read: false,
    },
    data: { read: true },
  });

  return result.count;
}

export function countUnread(notifications: NotificationRecord[]): number {
  return notifications.filter((item) => !item.read).length;
}
