import type { AssignmentRecord, NotificationRecord } from "@uyanik/database";

import { DEMO_PARENT_ID, DEMO_STUDENT_ID, listAssignmentsForParent, listAssignmentsForStudent } from "@/mocks/assignments";
import { DEMO_COACH_ID } from "@/mocks/messages";

type StoredNotification = NotificationRecord & { coachId?: string | null };

const globalStore = globalThis as typeof globalThis & {
  __uyanikNotifications?: StoredNotification[];
  __uyanikNotificationSourceKeys?: Set<string>;
};

const notifications = globalStore.__uyanikNotifications ?? (globalStore.__uyanikNotifications = []);
const sourceKeys =
  globalStore.__uyanikNotificationSourceKeys ?? (globalStore.__uyanikNotificationSourceKeys = new Set());

function nowIso(offsetMinutes = 0): string {
  return new Date(Date.now() - offsetMinutes * 60_000).toISOString();
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

  notifications.push(
    {
      id: "notif_s1",
      studentId: DEMO_STUDENT_ID,
      parentId: null,
      coachId: null,
      title: "Yeni ödev atandı",
      body: "Matematik · Turev — 40 soru, son teslim 6 Haziran",
      read: false,
      createdAt: nowIso(12),
    },
    {
      id: "notif_s2",
      studentId: DEMO_STUDENT_ID,
      parentId: null,
      coachId: null,
      title: "Deneme sonucun hazir",
      body: "Apotemi TYT-3 · 31 net — analizini incele",
      read: false,
      createdAt: nowIso(95),
    },
    {
      id: "notif_s3",
      studentId: DEMO_STUDENT_ID,
      parentId: null,
      coachId: null,
      title: "Randevu hatirlatmasi",
      body: "Koç görüşmen yarın 17:00'de (yüz yüze)",
      read: false,
      createdAt: nowIso(240),
    },
    {
      id: "notif_s4",
      studentId: DEMO_STUDENT_ID,
      parentId: null,
      coachId: null,
      title: "Seri rekorun yolda",
      body: "12 gundur kesintisizsin — bugunu de tamamla",
      read: true,
      createdAt: nowIso(600),
    },
    {
      id: "notif_s5",
      studentId: DEMO_STUDENT_ID,
      parentId: null,
      coachId: null,
      title: "Koçundan mesaj",
      body: "Dilek Emen: Paragrafa biraz daha agirlik verelim.",
      read: true,
      createdAt: nowIso(1450),
    },
    {
      id: "notif_c1",
      studentId: null,
      parentId: null,
      coachId: DEMO_COACH_ID,
      title: "Risk altinda ogrenci",
      body: "Ece Sahin 4 gündür ödev tamamlamadı",
      read: false,
      createdAt: nowIso(30),
    },
    {
      id: "notif_c2",
      studentId: null,
      parentId: null,
      coachId: DEMO_COACH_ID,
      title: "Ödev tamamlandı",
      body: "Elif Yildiz · Türev ödevini bitirdi (31/40 doğru)",
      read: false,
      createdAt: nowIso(75),
    },
    {
      id: "notif_c3",
      studentId: null,
      parentId: null,
      coachId: DEMO_COACH_ID,
      title: "Yeni deneme sonuclari",
      body: "OZDEBIR TYT-5 sonuclari ice aktarilmayi bekliyor",
      read: false,
      createdAt: nowIso(180),
    },
    {
      id: "notif_c4",
      studentId: null,
      parentId: null,
      coachId: DEMO_COACH_ID,
      title: "Randevu talebi",
      body: "Mert Demir online gorusme istedi · onayla",
      read: false,
      createdAt: nowIso(320),
    },
    {
      id: "notif_c5",
      studentId: null,
      parentId: null,
      coachId: DEMO_COACH_ID,
      title: "Tahsilat alindi",
      body: "Can Aydin · VIP yıllık ödemesi tamamlandı",
      read: true,
      createdAt: nowIso(900),
    },
    {
      id: "notif_p1",
      studentId: null,
      parentId: DEMO_PARENT_ID,
      coachId: null,
      title: "Çocuğunuzun deneme sonucu",
      body: "Elif · TYT-3 denemesinde 31 net (+2.5)",
      read: false,
      createdAt: nowIso(95),
    },
    {
      id: "notif_p2",
      studentId: null,
      parentId: DEMO_PARENT_ID,
      coachId: null,
      title: "Haftalik gelisim raporu",
      body: "Bu hafta %86 odev tamamlama — raporu goruntule",
      read: false,
      createdAt: nowIso(300),
    },
    {
      id: "notif_p3",
      studentId: null,
      parentId: DEMO_PARENT_ID,
      coachId: null,
      title: "Veli görüşmesi",
      body: "Koç Dilek Emen ile görüşme Cuma 18:00",
      read: false,
      createdAt: nowIso(720),
    },
    {
      id: "notif_p4",
      studentId: null,
      parentId: DEMO_PARENT_ID,
      coachId: null,
      title: "Abonelik yenileme",
      body: "Plus Koçluk aboneliğiniz 279 gün sonra yenilenecek",
      read: true,
      createdAt: nowIso(2880),
    },
  );
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
      coachId: null,
      title: "Gecikmiş ödev",
      body: `"${assignment.title}" ödevinin son tarihi geçti.`,
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

export function listForCoach(coachId: string): NotificationRecord[] {
  seedIfEmpty();
  return notifications
    .filter((item) => item.coachId === coachId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function markRead(
  notificationId: string,
  filter: { studentId?: string; parentId?: string; coachId?: string },
): NotificationRecord | null {
  seedIfEmpty();
  const notification = notifications.find(
    (item) =>
      item.id === notificationId &&
      (filter.studentId
        ? item.studentId === filter.studentId
        : filter.parentId
          ? item.parentId === filter.parentId
          : item.coachId === filter.coachId),
  );

  if (!notification) {
    return null;
  }

  notification.read = true;
  return notification;
}

export function markAllRead(filter: { studentId?: string; parentId?: string; coachId?: string }): number {
  seedIfEmpty();
  let count = 0;
  for (const notification of notifications) {
    const matches = filter.studentId
      ? notification.studentId === filter.studentId
      : filter.parentId
        ? notification.parentId === filter.parentId
        : notification.coachId === filter.coachId;
    if (matches && !notification.read) {
      notification.read = true;
      count += 1;
    }
  }
  return count;
}

export function countUnread(items: NotificationRecord[]): number {
  return items.filter((item) => !item.read).length;
}

export function pushStudentNotification(studentId: string, title: string, body: string): void {
  seedIfEmpty();
  notifications.unshift({
    id: `notification_${notifications.length + 1}`,
    studentId,
    parentId: null,
    coachId: null,
    title,
    body,
    read: false,
    createdAt: nowIso(),
  });
}

export function pushParentNotification(parentId: string, title: string, body: string): void {
  seedIfEmpty();
  notifications.unshift({
    id: `notification_${notifications.length + 1}`,
    studentId: null,
    parentId,
    coachId: null,
    title,
    body,
    read: false,
    createdAt: nowIso(),
  });
}

export function pushCoachNotification(coachId: string, title: string, body: string): void {
  seedIfEmpty();
  notifications.unshift({
    id: `notification_${notifications.length + 1}`,
    studentId: null,
    parentId: null,
    coachId,
    title,
    body,
    read: false,
    createdAt: nowIso(),
  });
}
