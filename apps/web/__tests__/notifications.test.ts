import { afterEach, describe, expect, it, vi } from "vitest";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";
import { DEMO_COACH_ID } from "@/mocks/messages";
import {
  countUnread,
  listForCoach,
  listForStudent,
  markAllRead,
  markRead,
  resetNotificationsForTests,
} from "@/mocks/notifications";

afterEach(() => {
  resetNotificationsForTests();
  vi.resetModules();
  vi.clearAllMocks();
});

describe("notifications mock store", () => {
  it("seeds sample notification and counts unread", () => {
    const notifications = listForStudent(DEMO_STUDENT_ID);
    expect(notifications.length).toBeGreaterThan(0);
    expect(countUnread(notifications)).toBeGreaterThan(0);
  });

  it("marks notification as read", () => {
    const notifications = listForStudent(DEMO_STUDENT_ID);
    const first = notifications[0];
    expect(first).toBeDefined();

    const updated = markRead(first!.id, { studentId: DEMO_STUDENT_ID });
    expect(updated?.read).toBe(true);
  });

  it("seeds coach notifications and marks all read", () => {
    const notifications = listForCoach(DEMO_COACH_ID);
    expect(notifications.length).toBeGreaterThan(0);
    expect(countUnread(notifications)).toBeGreaterThan(0);

    const marked = markAllRead({ coachId: DEMO_COACH_ID });
    expect(marked).toBeGreaterThan(0);
    expect(countUnread(listForCoach(DEMO_COACH_ID))).toBe(0);
  });
});

describe("notification service database branch", () => {
  it("marks all student notifications via repository", async () => {
    const markAllNotificationsRead = vi.fn().mockResolvedValue(3);
    vi.doMock("@/lib/data/env", () => ({ shouldUseDatabase: () => true }));
    vi.doMock("@uyanik/database", () => ({ notificationRepository: { markAllNotificationsRead } }));

    const { markAllStudentNotificationsRead } = await import("@/server/services/notification.service");
    await expect(markAllStudentNotificationsRead("student_001")).resolves.toBe(3);
    expect(markAllNotificationsRead).toHaveBeenCalledWith({ studentId: "student_001" });
  });

  it("marks all parent notifications via repository", async () => {
    const markAllNotificationsRead = vi.fn().mockResolvedValue(2);
    vi.doMock("@/lib/data/env", () => ({ shouldUseDatabase: () => true }));
    vi.doMock("@uyanik/database", () => ({ notificationRepository: { markAllNotificationsRead } }));

    const { markAllParentNotificationsRead } = await import("@/server/services/notification.service");
    await expect(markAllParentNotificationsRead("parent_001")).resolves.toBe(2);
    expect(markAllNotificationsRead).toHaveBeenCalledWith({ parentId: "parent_001" });
  });
});
