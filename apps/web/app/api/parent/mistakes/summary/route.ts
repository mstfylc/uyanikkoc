import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getParentMistakeInsights } from "@/server/services/mistake.service";

export const GET = withApiAuth(["parent"], async (_req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const insights = await getParentMistakeInsights(parentId);
  if (!insights) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ insights }, { status: 200 });
});
