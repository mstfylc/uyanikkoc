import type { AppointmentDay, AppointmentMode } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  createStudentAppointment,
  getCoachAppointmentSettings,
  listStudentAppointments,
} from "@/server/services/appointment.service";
import { listCoachRoster, resolveCoachIdForStudent } from "@/server/services/roster.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const appointments = await listStudentAppointments(studentId);
  return NextResponse.json({ appointments }, { status: 200 });
});

export const POST = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as {
    day?: AppointmentDay;
    slot?: string;
    mode?: AppointmentMode;
    topic?: string;
  };

  if (!body.day || !body.slot || !body.mode || !body.topic?.trim()) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const coachId = await resolveCoachIdForStudent(studentId);
  if (!coachId) {
    return NextResponse.json({ error: "Atanmis koc bulunamadi" }, { status: 404 });
  }

  const roster = await listCoachRoster(coachId);
  const entry = roster.find((item) => item.studentId === studentId);

  try {
    const settings = await getCoachAppointmentSettings(coachId);
    const appointment = await createStudentAppointment({
      coachId,
      studentId,
      studentName: entry?.displayName ?? "Ogrenci",
      day: body.day,
      slot: body.slot,
      mode: body.mode,
      topic: body.topic.trim(),
    });
    return NextResponse.json({ appointment, settings }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 400 },
    );
  }
});
