import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { addCoachStudent, listCoachRoster } from "@/server/services/roster.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const students = await listCoachRoster(coachId);
  return NextResponse.json({ students }, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { displayName?: string; email?: string };
  const displayName = body.displayName?.trim();
  const email = body.email?.trim();

  if (!displayName || !email) {
    return NextResponse.json({ error: "displayName and email required" }, { status: 400 });
  }

  try {
    const student = await addCoachStudent(coachId, { displayName, email });
    return NextResponse.json({ student }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Student create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
