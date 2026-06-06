import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { createExam } from "@/server/services/online-exam.service";

const TYPES = ["TYT", "AYT", "LGS"] as const;

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
