import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  getStudentSchedule,
  getStudentStudyPlan,
  setStudentScheduleCell,
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
  };

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
