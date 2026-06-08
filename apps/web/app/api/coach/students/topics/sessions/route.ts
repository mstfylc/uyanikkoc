import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { coachHasStudent } from "@/server/services/roster.service";
import {
  listStudentTopicStudySessions,
  upsertStudentTopicStudySession,
} from "@/server/services/topic.service";

export const GET = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const studentId = req.nextUrl.searchParams.get("studentId")?.trim();
  if (!studentId || !(await coachHasStudent(coachId, studentId))) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const sessions = await listStudentTopicStudySessions(studentId);
  return NextResponse.json({ sessions }, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as {
    id?: string;
    studentId?: string;
    topicId?: string;
    date?: string;
    questionCount?: number;
    correctCount?: number;
  };

  if (!body.studentId || !(await coachHasStudent(coachId, body.studentId))) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  if (!body.topicId || !body.date || body.questionCount == null || body.correctCount == null) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const record = await upsertStudentTopicStudySession({
      id: body.id,
      studentId: body.studentId,
      topicId: body.topicId,
      date: body.date,
      questionCount: body.questionCount,
      correctCount: body.correctCount,
    });

    if (!record) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ session: record }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 400 },
    );
  }
});
