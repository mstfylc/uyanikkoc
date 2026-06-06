import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  addStudentStudyBlock,
  getStudentSchedule,
  getStudentStudyPlan,
  setStudentScheduleCell,
  advanceStudentStudyBlock,
  toggleStudentStudyBlock,
  updateStudentSchedule,
} from "@/server/services/schedule.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const [schedule, studyPlan] = await Promise.all([
    getStudentSchedule(studentId),
    getStudentStudyPlan(studentId),
  ]);
  return NextResponse.json({ schedule, studyPlan }, { status: 200 });
});

export const PATCH = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as {
    attendsSchool?: boolean;
    grid?: Record<string, string[]>;
    cell?: { day: string; period: number; value: string };
    studyBlockId?: string;
    studyAction?: "start" | "finish" | "reset";
  };

  if (body.studyBlockId && body.studyAction) {
    const block = await advanceStudentStudyBlock(studentId, body.studyBlockId, body.studyAction);
    if (!block) {
      return NextResponse.json({ error: "Study block not found" }, { status: 404 });
    }
    const studyPlan = await getStudentStudyPlan(studentId);
    return NextResponse.json({ block, studyPlan }, { status: 200 });
  }

  if (body.studyBlockId) {
    const block = await toggleStudentStudyBlock(studentId, body.studyBlockId);
    if (!block) {
      return NextResponse.json({ error: "Study block not found" }, { status: 404 });
    }
    const studyPlan = await getStudentStudyPlan(studentId);
    return NextResponse.json({ block, studyPlan }, { status: 200 });
  }

  if (body.cell) {
    const schedule = await setStudentScheduleCell(
      studentId,
      body.cell.day,
      body.cell.period,
      body.cell.value,
    );
    return NextResponse.json({ schedule }, { status: 200 });
  }

  const schedule = await updateStudentSchedule(studentId, {
    attendsSchool: body.attendsSchool,
    grid: body.grid,
  });
  return NextResponse.json({ schedule }, { status: 200 });
});

export const POST = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as {
    day?: string;
    time?: string;
    subject?: string;
    topic?: string;
    type?: string;
    source?: string;
    correct?: number;
    wrong?: number;
  };

  const day = body.day?.trim();
  const time = body.time?.trim();
  const subject = body.subject?.trim();
  const topic = body.topic?.trim();

  if (!day || !time || !subject || !topic) {
    return NextResponse.json({ error: "day, time, subject and topic are required" }, { status: 400 });
  }

  const block = await addStudentStudyBlock(studentId, {
    day,
    time,
    subject,
    topic,
    type: body.type?.trim() || "Soru",
    source: body.source?.trim(),
    correct: body.correct,
    wrong: body.wrong,
  });
  const studyPlan = await getStudentStudyPlan(studentId);
  return NextResponse.json({ block, studyPlan }, { status: 200 });
});
