import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { setStudentMotivationEnabled } from "@/server/services/motivation.service";

export const PATCH = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { enabled?: boolean };
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
  }

  const profile = await setStudentMotivationEnabled(studentId, body.enabled);
  if (!profile) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile }, { status: 200 });
});
