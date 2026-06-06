import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getStudentRating, submitRating } from "@/server/services/rating.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  const rating = await getStudentRating(studentId);
  return NextResponse.json({ rating }, { status: 200 });
});

export const POST = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) return NextResponse.json({ error: "Student profile missing" }, { status: 400 });

  const body = (await req.json()) as { stars?: number; comment?: string; coachId?: string };
  const stars = Number(body.stars);
  if (!stars || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "stars must be 1..5" }, { status: 400 });
  }
  const coachId = session.user.coachId ?? body.coachId;
  if (!coachId) return NextResponse.json({ error: "coach not resolved" }, { status: 400 });

  const rating = await submitRating({ studentId, coachId, stars, comment: body.comment ?? null });
  return NextResponse.json({ rating }, { status: 201 });
});
