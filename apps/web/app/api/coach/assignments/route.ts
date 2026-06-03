import type { AssignmentCreateInput } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  DEMO_PARENT_ID,
  DEMO_STUDENT_ID,
  createAssignment,
  listAssignmentsForCoach,
} from "@/lib/data/assignments";

type CreateAssignmentBody = Partial<
  Pick<AssignmentCreateInput, "description" | "type" | "priority" | "subject" | "dueDate">
> & {
  title?: string;
};

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const assignments = await listAssignmentsForCoach(coachId);
  return NextResponse.json({ assignments }, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const body = (await req.json()) as CreateAssignmentBody;
  const title = body.title?.trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const coachId = session.user.coachId;
  const branchId = session.user.branchId;
  if (!coachId || !branchId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const assignment = await createAssignment({
    title,
    coachId,
    studentId: DEMO_STUDENT_ID,
    parentId: DEMO_PARENT_ID,
    branchId,
    description: body.description ?? null,
    type: body.type,
    priority: body.priority,
    subject: body.subject ?? null,
    dueDate: body.dueDate ?? null,
  });

  return NextResponse.json({ assignment }, { status: 200 });
});
