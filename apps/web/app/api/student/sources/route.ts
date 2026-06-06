import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  addStudentSource,
  listStudentSources,
  removeStudentSource,
} from "@/server/services/student-sources.service";

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const sources = await listStudentSources(studentId);
  return NextResponse.json({ sources }, { status: 200 });
});

export const POST = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { label?: string };
  const label = body.label?.trim();
  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }

  const sources = await addStudentSource(studentId, label);
  return NextResponse.json({ sources }, { status: 201 });
});

export const DELETE = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { label?: string };
  const label = body.label?.trim();
  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }

  const sources = await removeStudentSource(studentId, label);
  return NextResponse.json({ sources }, { status: 200 });
});
