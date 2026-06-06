import { appRoleToDbRole } from "@uyanik/tokens";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  appendThreadMessage,
  canAccessThread,
  getMessageThread,
} from "@/server/services/message.service";

function getThreadId(req: Request): string {
  const segments = new URL(req.url).pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
}

export const GET = withApiAuth(["parent"], async (req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const thread = await getMessageThread(getThreadId(req));
  if (!thread || !canAccessThread(thread, { parentId, userId: session.user.id })) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  return NextResponse.json({ thread }, { status: 200 });
});

export const POST = withApiAuth(["parent"], async (req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const threadId = getThreadId(req);
  const thread = await getMessageThread(threadId);
  if (!thread || !canAccessThread(thread, { parentId, userId: session.user.id })) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const body = (await req.json()) as { body?: string };
  const messageBody = body.body?.trim();
  if (!messageBody) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const message = await appendThreadMessage(threadId, appRoleToDbRole.parent, messageBody);
  if (!message) {
    return NextResponse.json({ error: "Message could not be sent" }, { status: 500 });
  }

  return NextResponse.json({ message }, { status: 200 });
});
