import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getParentNetGainMap } from "@/server/services/exam.service";

export const GET = withApiAuth(["parent"], async (_req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const netGain = await getParentNetGainMap(parentId);
  if (!netGain) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ netGain }, { status: 200 });
});
