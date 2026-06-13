import type { AppointmentDay, AppointmentMode } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { toAppointmentContract } from "@/lib/contracts/web-v6";
import {
  createStudentAppointment,
  getCoachAppointmentSettings,
  listStudentAppointments,
} from "@/server/services/appointment.service";
import { resolveStudentIdForParent } from "@/server/services/motivation.service";
import { listCoachRoster, resolveCoachIdForStudent } from "@/server/services/roster.service";

export const GET = withApiAuth(["parent"], async (_req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const studentId = await resolveStudentIdForParent(parentId);
  if (!studentId) {
    return NextResponse.json({ appointments: [], appts: [], settings: null }, { status: 200 });
  }

  const coachId = await resolveCoachIdForStudent(studentId);
  const [appointments, settings] = await Promise.all([
    listStudentAppointments(studentId),
    coachId ? getCoachAppointmentSettings(coachId) : Promise.resolve(null),
  ]);

  return NextResponse.json({ appointments, appts: appointments.map((item) => toAppointmentContract(item)), settings }, { status: 200 });
});

export const POST = withApiAuth(["parent"], async (req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const studentId = await resolveStudentIdForParent(parentId);
  if (!studentId) {
    return NextResponse.json({ error: "Ogrenci profili bulunamadi" }, { status: 404 });
  }

  const coachId = await resolveCoachIdForStudent(studentId);
  if (!coachId) {
    return NextResponse.json({ error: "Atanmis koc bulunamadi" }, { status: 404 });
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

  const roster = await listCoachRoster(coachId);
  const entry = roster.find((item) => item.studentId === studentId);

  try {
    const settings = await getCoachAppointmentSettings(coachId);
    const appointment = await createStudentAppointment(
      {
        coachId,
        studentId,
        studentName: entry?.displayName ?? "Ogrenci",
        day: body.day,
        slot: body.slot,
        mode: body.mode,
        topic: body.topic.trim(),
        requesterRole: "parent",
      },
      "parent",
    );
    return NextResponse.json({ appointment, appt: toAppointmentContract(appointment), settings }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 400 },
    );
  }
});
