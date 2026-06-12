import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { listCoachMessageThreads } from "@/server/services/message.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const threads = await listCoachMessageThreads(coachId, session.user.id);
  return NextResponse.json({ threads }, { status: 200 });
});
