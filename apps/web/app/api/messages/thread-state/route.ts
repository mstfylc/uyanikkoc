import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  canAccessThread,
  getMessageThread,
  markMessageThreadRead,
  setMessageThreadMuted,
} from "@/server/services/message.service";

type ThreadStateBody = {
  threadId?: string;
  action?: "read" | "mute";
  muted?: boolean;
};

export const POST = withApiAuth(["student", "parent", "coach"], async (req, { session }) => {
  const body = (await req.json()) as ThreadStateBody;
  const threadId = body.threadId?.trim();
  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  const thread = await getMessageThread(threadId, session.user.id);
  if (!thread || !canAccessThread(thread, {
    userId: session.user.id,
    coachId: session.user.coachId,
    studentId: session.user.studentId,
    parentId: session.user.parentId,
  })) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (body.action === "mute") {
    await setMessageThreadMuted(threadId, session.user.id, Boolean(body.muted));
  } else {
    await markMessageThreadRead(threadId, session.user.id);
  }

  const updated = await getMessageThread(threadId, session.user.id);
  return NextResponse.json({ thread: updated }, { status: 200 });
});
