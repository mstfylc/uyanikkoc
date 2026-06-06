import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { listApprovedReportsForParent } from "@/server/services/report.service";

export const GET = withApiAuth(["parent"], async (_req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) return NextResponse.json({ error: "Parent missing" }, { status: 400 });
  const reports = await listApprovedReportsForParent(parentId);
  return NextResponse.json({ reports }, { status: 200 });
});
