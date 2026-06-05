import { afterEach, describe, expect, it } from "vitest";

import { DEMO_STUDENT_ID } from "@/mocks/assignments";
import {
  countUnread,
  listForStudent,
  markRead,
  resetNotificationsForTests,
} from "@/mocks/notifications";

afterEach(() => {
  resetNotificationsForTests();
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
});
