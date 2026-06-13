import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { toMessagingContract } from "@/lib/contracts/web-v6";
import { listStudentMessageThreads } from "@/server/services/message.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const threads = await listStudentMessageThreads(studentId, session.user.id);
  return NextResponse.json({ threads, msgRoot: toMessagingContract(threads, "student") }, { status: 200 });
});
