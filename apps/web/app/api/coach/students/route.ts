import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { listCoachRoster } from "@/server/services/roster.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const students = await listCoachRoster(coachId);
  return NextResponse.json({ students }, { status: 200 });
});
