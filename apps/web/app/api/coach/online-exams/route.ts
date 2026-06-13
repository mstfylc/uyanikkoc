import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { createExam, deleteCoachExam, listCoachExams } from "@/server/services/online-exam.service";

const TYPES = ["TYT", "AYT", "LGS"] as const;

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const branchId = session.user.branchId;
  if (!branchId) return NextResponse.json({ error: "Branch missing" }, { status: 400 });
  const exams = await listCoachExams(branchId);
  return NextResponse.json({ exams }, { status: 200 });
});

export const DELETE = withApiAuth(["coach"], async (req, { session }) => {
  const branchId = session.user.branchId;
  if (!branchId) return NextResponse.json({ error: "Branch missing" }, { status: 400 });
  const examId = req.nextUrl.searchParams.get("id")?.trim();
  if (!examId) return NextResponse.json({ error: "id required" }, { status: 400 });
  const ok = await deleteCoachExam(branchId, examId);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true }, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const branchId = session.user.branchId;
  if (!branchId) return NextResponse.json({ error: "Branch missing" }, { status: 400 });

  const body = (await req.json()) as {
    title?: string;
    publisher?: string;
    examType?: string;
    answerKey?: string[];
    cargoStatus?: string;
  };
  const title = body.title?.trim();
  const publisher = body.publisher?.trim() ?? "";
  const examType = body.examType as (typeof TYPES)[number] | undefined;
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  if (!examType || !TYPES.includes(examType)) {
    return NextResponse.json({ error: "invalid examType" }, { status: 400 });
  }
  if (!Array.isArray(body.answerKey) || body.answerKey.length === 0) {
    return NextResponse.json({ error: "answerKey[] required" }, { status: 400 });
  }

  const exam = await createExam({
    title,
    publisher,
    examType,
    answerKey: body.answerKey,
    questionCount: body.answerKey.length,
    branchId,
    cargoStatus: body.cargoStatus,
  });
  return NextResponse.json({ exam }, { status: 201 });
});
