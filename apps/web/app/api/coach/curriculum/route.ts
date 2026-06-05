import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getCoachCurriculum, updateCoachCurriculum } from "@/server/services/curriculum.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const curriculum = await getCoachCurriculum(coachId);
  return NextResponse.json({ curriculum }, { status: 200 });
});

export const PATCH = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as {
    examType?: import("@uyanik/database").TopicExamType;
    subjects?: import("@uyanik/database").CurriculumRecord["subjects"];
  };

  const curriculum = await updateCoachCurriculum(coachId, body);
  return NextResponse.json({ curriculum }, { status: 200 });
});
