import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { toNotificationContract } from "@/lib/contracts/web-v6";
import {
  listCoachNotifications,
  markAllCoachNotificationsRead,
  markCoachNotificationRead,
} from "@/server/services/notification.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const result = await listCoachNotifications(coachId);
  return NextResponse.json(
    { ...result, notificationQueue: result.notifications.map(toNotificationContract) },
    { status: 200 },
  );
});

export const PATCH = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { id?: string; markAll?: boolean };
  if (body.markAll) {
    const count = await markAllCoachNotificationsRead(coachId);
    return NextResponse.json({ marked: count }, { status: 200 });
  }

  const notificationId = body.id?.trim();
  if (!notificationId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const notification = await markCoachNotificationRead(coachId, notificationId);
  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  return NextResponse.json({ notification, item: toNotificationContract(notification) }, { status: 200 });
});
