import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { broadcastMotivation } from "@/server/services/motivation-broadcast.service";
import { listCoachStudentIds } from "@/server/services/roster.service";

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) return NextResponse.json({ error: "Coach missing" }, { status: 400 });

  const body = (await req.json()) as { studentIds?: string[]; scope?: "all"; message?: string };
  const message = body.message?.trim();
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  const targets =
    body.scope === "all" ? await listCoachStudentIds(coachId) : (body.studentIds ?? []);
  if (targets.length === 0) return NextResponse.json({ error: "no targets" }, { status: 400 });

  const sent = await broadcastMotivation(coachId, targets, message);
  return NextResponse.json({ sent }, { status: 201 });
});
