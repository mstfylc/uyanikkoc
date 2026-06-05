import type { AssignmentPriority, AssignmentType } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { createCoachTemplate, listCoachTemplates } from "@/server/services/template.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const templates = await listCoachTemplates(coachId);
  return NextResponse.json({ templates }, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as {
    title?: string;
    description?: string | null;
    type?: AssignmentType;
    priority?: AssignmentPriority;
    subject?: string | null;
  };

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const template = await createCoachTemplate({
    coachId,
    title,
    description: body.description ?? null,
    type: body.type,
    priority: body.priority,
    subject: body.subject ?? null,
  });

  return NextResponse.json({ template }, { status: 200 });
});
