import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getParentSummary } from "@/lib/data/assignments";

export const GET = withApiAuth(["parent"], async (_req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const summary = await getParentSummary(parentId);
  return NextResponse.json({ summary }, { status: 200 });
});
