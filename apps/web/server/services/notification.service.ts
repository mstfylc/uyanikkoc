import type { NotificationRecord } from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryNotifications from "@/mocks/notifications";

export type NotificationListResult = {
  notifications: NotificationRecord[];
  unreadCount: number;
};

async function syncAndListForStudent(studentId: string): Promise<NotificationRecord[]> {
  if (shouldUseDatabase()) {
    const { assignmentRepository, notificationRepository } = await import("@uyanik/database");
    const assignments = await assignmentRepository.listAssignmentsForStudent(studentId);
    await notificationRepository.syncOverdueNotifications(studentId, null, assignments);
    return notificationRepository.listNotificationsForStudent(studentId);
  }

  memoryNotifications.syncOverdueForStudent(studentId);
  return memoryNotifications.listForStudent(studentId);
}

async function syncAndListForParent(parentId: string): Promise<NotificationRecord[]> {
  if (shouldUseDatabase()) {
    const { assignmentRepository, notificationRepository } = await import("@uyanik/database");
    const summary = await assignmentRepository.getParentSummary(parentId);
    await notificationRepository.syncOverdueNotifications(null, parentId, summary.assignments);
    return notificationRepository.listNotificationsForParent(parentId);
  }

  memoryNotifications.syncOverdueForParent(parentId);
  return memoryNotifications.listForParent(parentId);
}

function countUnread(notifications: NotificationRecord[]): number {
  return notifications.filter((item) => !item.read).length;
}

export async function listStudentNotifications(studentId: string): Promise<NotificationListResult> {
  const notifications = await syncAndListForStudent(studentId);
  return { notifications, unreadCount: countUnread(notifications) };
}

export async function listParentNotifications(parentId: string): Promise<NotificationListResult> {
  const notifications = await syncAndListForParent(parentId);
  return { notifications, unreadCount: countUnread(notifications) };
}

export async function markStudentNotificationRead(
  studentId: string,
  notificationId: string,
): Promise<NotificationRecord | null> {
  if (shouldUseDatabase()) {
    const { notificationRepository } = await import("@uyanik/database");
    return notificationRepository.markNotificationRead(notificationId, { studentId });
  }

  return memoryNotifications.markRead(notificationId, { studentId });
}

export async function markParentNotificationRead(
  parentId: string,
  notificationId: string,
): Promise<NotificationRecord | null> {
  if (shouldUseDatabase()) {
    const { notificationRepository } = await import("@uyanik/database");
    return notificationRepository.markNotificationRead(notificationId, { parentId });
  }

  return memoryNotifications.markRead(notificationId, { parentId });
}

export async function listCoachNotifications(coachId: string): Promise<NotificationListResult> {
  const notifications = memoryNotifications.listForCoach(coachId);
  return { notifications, unreadCount: countUnread(notifications) };
}

export async function markCoachNotificationRead(
  coachId: string,
  notificationId: string,
): Promise<NotificationRecord | null> {
  return memoryNotifications.markRead(notificationId, { coachId });
}

export async function markAllStudentNotificationsRead(studentId: string): Promise<number> {
  if (shouldUseDatabase()) {
    const { notificationRepository } = await import("@uyanik/database");
    return notificationRepository.markAllNotificationsRead({ studentId });
  }
  return memoryNotifications.markAllRead({ studentId });
}

export async function markAllParentNotificationsRead(parentId: string): Promise<number> {
  if (shouldUseDatabase()) {
    const { notificationRepository } = await import("@uyanik/database");
    return notificationRepository.markAllNotificationsRead({ parentId });
  }
  return memoryNotifications.markAllRead({ parentId });
}

export async function markAllCoachNotificationsRead(coachId: string): Promise<number> {
  return memoryNotifications.markAllRead({ coachId });
}
