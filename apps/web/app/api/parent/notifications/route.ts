import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  listParentNotifications,
  markParentNotificationRead,
} from "@/server/services/notification.service";

export const GET = withApiAuth(["parent"], async (_req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const result = await listParentNotifications(parentId);
  return NextResponse.json(result, { status: 200 });
});

export const PATCH = withApiAuth(["parent"], async (req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { id?: string };
  const notificationId = body.id?.trim();
  if (!notificationId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const notification = await markParentNotificationRead(parentId, notificationId);
  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  return NextResponse.json({ notification }, { status: 200 });
});
