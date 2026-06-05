import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { buildCoachReportSummary } from "@/server/services/appointment.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const report = await buildCoachReportSummary(coachId);
  return NextResponse.json({ report }, { status: 200 });
});
