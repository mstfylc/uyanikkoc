import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { fromOdevContract, toOdevContract } from "@/lib/contracts/web-v6";
import {
  createCoachAssignmentBatch,
  createCoachAssignment,
  listCoachAssignments,
  type CoachCreateAssignmentBatchBody,
  type CoachCreateAssignmentBody,
} from "@/server/services/assignment.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const assignments = await listCoachAssignments(coachId);
  return NextResponse.json({ assignments, odevler: assignments.map(toOdevContract) }, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  const branchId = session.user.branchId;
  if (!coachId || !branchId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  try {
    const rawBody = (await req.json()) as
      | (Partial<CoachCreateAssignmentBody> & Parameters<typeof fromOdevContract>[0])
      | CoachCreateAssignmentBatchBody;

    const maybeBatch = rawBody as Partial<CoachCreateAssignmentBatchBody>;
    if (Array.isArray(maybeBatch.studentIds) || Array.isArray(maybeBatch.items)) {
      const studentIds = Array.isArray(maybeBatch.studentIds)
        ? maybeBatch.studentIds.map((id: string) => id.trim()).filter(Boolean)
        : [];
      const items = Array.isArray(maybeBatch.items) ? maybeBatch.items : [];
      if (!studentIds.length || !items.length) {
        return NextResponse.json({ error: "studentIds and items are required" }, { status: 400 });
      }

      const inputs = items.map((item) => {
        const contractBody = fromOdevContract(item);
        return {
          ...contractBody,
          title: contractBody.title.trim(),
        };
      });
      const assignments = await createCoachAssignmentBatch(coachId, branchId, studentIds, inputs);
      return NextResponse.json(
        { created: assignments.length, assignments, odevler: assignments.map(toOdevContract) },
        { status: 200 },
      );
    }

    const singleBody = rawBody as Partial<CoachCreateAssignmentBody> & Parameters<typeof fromOdevContract>[0];
    const contractBody = fromOdevContract(singleBody);
    const body = { ...singleBody, ...contractBody } as Partial<CoachCreateAssignmentBody>;
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const assignment = await createCoachAssignment(coachId, branchId, {
      title,
      studentId: body.studentId,
      description: body.description,
      week: body.week,
      topic: body.topic,
      source: body.source,
      count: body.count,
      odevType: body.odevType,
      odevTypes: body.odevTypes,
      note: body.note,
      type: body.type,
      priority: body.priority,
      subject: body.subject,
      dueDate: body.dueDate,
      smart: body.smart,
      overdueAlert: body.overdueAlert,
      quality: body.quality,
      feedback: body.feedback,
    });

    return NextResponse.json({ assignment, odev: toOdevContract(assignment) }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Assignment create failed";
    const status = message === "Student not in roster" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
});
