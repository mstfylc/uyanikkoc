import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { coachHasStudent } from "@/server/services/roster.service";
import { getCoachTopicTargets, saveCoachTopicTargets } from "@/server/services/topic.service";

function parseTargets(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, number>;
}

export const GET = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const studentId = req.nextUrl.searchParams.get("studentId")?.trim() ?? "";
  if (!studentId || !(await coachHasStudent(coachId, studentId))) {
    return NextResponse.json({ error: "Öğrenci bulunamadı." }, { status: 404 });
  }

  const record = await getCoachTopicTargets(coachId, studentId);
  return NextResponse.json({ targets: record?.targets ?? {}, updatedAt: record?.updatedAt ?? null });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    studentId?: unknown;
    targets?: unknown;
  };
  const studentId = typeof body.studentId === "string" ? body.studentId.trim() : "";

  if (!studentId || !(await coachHasStudent(coachId, studentId))) {
    return NextResponse.json({ error: "Öğrenci bulunamadı." }, { status: 404 });
  }

  const record = await saveCoachTopicTargets(coachId, studentId, parseTargets(body.targets));
  return NextResponse.json({ targets: record.targets, updatedAt: record.updatedAt });
});
