import type { AssignmentRecord, NotificationRecord } from "@uyanik/database";

import { DEMO_STUDENT_ID, listAssignmentsForParent, listAssignmentsForStudent } from "@/mocks/assignments";

const globalStore = globalThis as typeof globalThis & {
  __uyanikNotifications?: NotificationRecord[];
  __uyanikNotificationSourceKeys?: Set<string>;
};

const notifications = globalStore.__uyanikNotifications ?? (globalStore.__uyanikNotifications = []);
const sourceKeys =
  globalStore.__uyanikNotificationSourceKeys ?? (globalStore.__uyanikNotificationSourceKeys = new Set());

function nowIso(): string {
  return new Date().toISOString();
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

function seedIfEmpty() {
  if (notifications.length > 0) {
    return;
  }

  const timestamp = nowIso();
  notifications.push({
    id: "notification_sample_1",
    studentId: DEMO_STUDENT_ID,
    parentId: null,
    title: "Hos geldin",
    body: "Uyanik Koc bildirimlerine hos geldin. Gecikmis odevler burada gorunur.",
    read: false,
    createdAt: timestamp,
  });
}

export function resetNotificationsForTests(): void {
  notifications.length = 0;
  sourceKeys.clear();
}

export function syncOverdue(
  studentId: string | null,
  parentId: string | null,
  assignments: AssignmentRecord[],
): void {
  for (const assignment of assignments) {
    if (!isOverdueAssignment(assignment)) {
      continue;
    }

    const sourceKey = `overdue:${assignment.id}`;
    if (sourceKeys.has(sourceKey)) {
      continue;
    }

    sourceKeys.add(sourceKey);
    notifications.push({
      id: `notification_${notifications.length + 1}`,
      studentId,
      parentId,
      title: "Gecikmis odev",
      body: `"${assignment.title}" odevinin son tarihi gecti.`,
      read: false,
      createdAt: nowIso(),
    });
  }
}

export function syncOverdueForStudent(studentId: string): void {
  syncOverdue(studentId, null, listAssignmentsForStudent(studentId));
}

export function syncOverdueForParent(parentId: string): void {
  syncOverdue(null, parentId, listAssignmentsForParent(parentId));
}

export function listForStudent(studentId: string): NotificationRecord[] {
  seedIfEmpty();
  syncOverdueForStudent(studentId);
  return notifications
    .filter((item) => item.studentId === studentId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function listForParent(parentId: string): NotificationRecord[] {
  seedIfEmpty();
  syncOverdueForParent(parentId);
  return notifications
    .filter((item) => item.parentId === parentId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function markRead(
  notificationId: string,
  filter: { studentId?: string; parentId?: string },
): NotificationRecord | null {
  seedIfEmpty();
  const notification = notifications.find(
    (item) =>
      item.id === notificationId &&
      (filter.studentId ? item.studentId === filter.studentId : item.parentId === filter.parentId),
  );

  if (!notification) {
    return null;
  }

  notification.read = true;
  return notification;
}

export function countUnread(items: NotificationRecord[]): number {
  return items.filter((item) => !item.read).length;
}
