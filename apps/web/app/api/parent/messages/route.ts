import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { toMessagingContract } from "@/lib/contracts/web-v6";
import { listParentMessageThreads } from "@/server/services/message.service";

export const GET = withApiAuth(["parent"], async (_req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const threads = await listParentMessageThreads(parentId, session.user.id);
  return NextResponse.json({ threads, msgRoot: toMessagingContract(threads, "parent") }, { status: 200 });
});
