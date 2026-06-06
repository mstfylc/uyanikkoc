import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  listStudentNotifications,
  markAllStudentNotificationsRead,
  markStudentNotificationRead,
} from "@/server/services/notification.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const result = await listStudentNotifications(studentId);
  return NextResponse.json(result, { status: 200 });
});

export const PATCH = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { id?: string; markAll?: boolean };
  if (body.markAll) {
    const marked = await markAllStudentNotificationsRead(studentId);
    return NextResponse.json({ marked }, { status: 200 });
  }

  const notificationId = body.id?.trim();
  if (!notificationId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const notification = await markStudentNotificationRead(studentId, notificationId);
  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  return NextResponse.json({ notification }, { status: 200 });
});
