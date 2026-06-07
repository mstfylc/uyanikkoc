import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { approveReport } from "@/server/services/report.service";

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const id = req.url.split("/reports/")[1]?.split("/")[0];
  if (!id) return NextResponse.json({ error: "id missing" }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as { note?: string };
  const report = await approveReport(coachId, id, body.note ?? "");
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  return NextResponse.json({ report }, { status: 200 });
});
