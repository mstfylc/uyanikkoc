import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  createCoachAssignment,
  listCoachAssignments,
  type CoachCreateAssignmentBody,
} from "@/server/services/assignment.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const assignments = await listCoachAssignments(coachId);
  return NextResponse.json({ assignments }, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const body = (await req.json()) as Partial<CoachCreateAssignmentBody>;
  const title = body.title?.trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const coachId = session.user.coachId;
  const branchId = session.user.branchId;
  if (!coachId || !branchId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const assignment = await createCoachAssignment(coachId, branchId, {
    title,
    description: body.description,
    type: body.type,
    priority: body.priority,
    subject: body.subject,
    dueDate: body.dueDate,
  });

  return NextResponse.json({ assignment }, { status: 200 });
});
