import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/api-guard";
import { getParentSummary } from "@/lib/data/assignments";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, ["parent"]);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const parentId = authResult.session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const summary = await getParentSummary(parentId);
  return NextResponse.json({ summary }, { status: 200 });
}
