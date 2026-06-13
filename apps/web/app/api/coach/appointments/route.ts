import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { toAppointmentContract } from "@/lib/contracts/web-v6";
import {
  getCoachAppointmentSettings,
  listCoachAppointments,
  updateCoachAppointmentSettings,
} from "@/server/services/appointment.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const [settings, appointments] = await Promise.all([
    getCoachAppointmentSettings(coachId),
    listCoachAppointments(coachId),
  ]);

  return NextResponse.json({ settings, appointments, appts: appointments.map((item) => toAppointmentContract(item)) }, { status: 200 });
});

export const PATCH = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as Partial<{
    weeklyLimit: number;
    weeklyLimitStudent: number;
    weeklyLimitParent: number;
    allowOnline: boolean;
    allowInPerson: boolean;
    allowPhone: boolean;
    availability: Record<string, string[]>;
    slotModes: Record<string, Record<string, ("online" | "in_person" | "phone")[]>>;
  }>;

  const settings = await updateCoachAppointmentSettings(coachId, body);
  return NextResponse.json({ settings }, { status: 200 });
});
