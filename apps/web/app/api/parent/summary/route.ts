import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getParentAssignmentSummary } from "@/server/services/assignment.service";

export const GET = withApiAuth(["parent"], async (_req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const summary = await getParentAssignmentSummary(parentId);
  return NextResponse.json({ summary }, { status: 200 });
});
