import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  approveAllReportsForCoach,
  approveReport,
  generateWeeklyReports,
} from "@/server/services/report.service";
import { buildCoachReportSummary } from "@/server/services/appointment.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const report = await buildCoachReportSummary(coachId);
  return NextResponse.json({ report }, { status: 200 });
});

export const PATCH = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as {
    reportId?: string;
    approveAll?: boolean;
    generate?: boolean;
  };

  if (body.generate) {
    const count = await generateWeeklyReports(coachId);
    return NextResponse.json({ ok: true, generated: count }, { status: 200 });
  }

  if (body.approveAll) {
    await approveAllReportsForCoach(coachId);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!body.reportId) {
    return NextResponse.json({ error: "reportId is required" }, { status: 400 });
  }

  const updated = await approveReport(coachId, body.reportId);
  if (!updated) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({ report: updated }, { status: 200 });
});
