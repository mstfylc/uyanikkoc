import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getCoachRatingSummary } from "@/server/services/rating.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  const summary = await getCoachRatingSummary(coachId);
  return NextResponse.json(summary, { status: 200 });
});
