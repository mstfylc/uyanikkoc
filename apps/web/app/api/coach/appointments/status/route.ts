import type { AppointmentStatus } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { setCoachAppointmentStatus } from "@/server/services/appointment.service";

const STATUSES: AppointmentStatus[] = ["pending", "approved", "rejected", "cancelled"];

export const PATCH = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { appointmentId?: string; status?: AppointmentStatus };
  if (!body.appointmentId || !body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const appointment = await setCoachAppointmentStatus(coachId, body.appointmentId, body.status);
  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  return NextResponse.json({ appointment }, { status: 200 });
});
