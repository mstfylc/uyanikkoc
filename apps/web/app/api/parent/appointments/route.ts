import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { listStudentAppointments } from "@/server/services/appointment.service";
import { resolveStudentIdForParent } from "@/server/services/motivation.service";

export const GET = withApiAuth(["parent"], async (_req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const studentId = await resolveStudentIdForParent(parentId);
  if (!studentId) {
    return NextResponse.json({ appointments: [] }, { status: 200 });
  }

  const appointments = await listStudentAppointments(studentId);
  return NextResponse.json({ appointments }, { status: 200 });
});
