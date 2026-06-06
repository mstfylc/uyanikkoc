import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  getStudentDenemeContext,
  registerDenemeEvent,
  unregisterDenemeEvent,
} from "@/server/services/deneme-events.service";

export const GET = withApiAuth(["student", "parent"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }
  const ctx = await getStudentDenemeContext(studentId);
  return NextResponse.json(ctx, { status: 200 });
});

export const POST = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { eventId?: string; action?: "register" | "unregister" };
  if (!body.eventId || !body.action) {
    return NextResponse.json({ error: "eventId and action required" }, { status: 400 });
  }

  if (body.action === "unregister") {
    await unregisterDenemeEvent(body.eventId, studentId);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const registration = await registerDenemeEvent(body.eventId, studentId);
  return NextResponse.json({ registration }, { status: 200 });
});
