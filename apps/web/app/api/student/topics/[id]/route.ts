import type { TopicExamType } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  deleteStudentSubject,
  deleteStudentTopic,
  updateStudentSubject,
  updateStudentTopic,
} from "@/server/services/topic.service";

const EXAM_TYPES: TopicExamType[] = ["TYT", "AYT", "LGS", "GENEL"];

function getResourceId(req: Request): string {
  const segments = new URL(req.url).pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
}

export const PATCH = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const id = getResourceId(req);
  const kind = new URL(req.url).searchParams.get("kind");

  const body = (await req.json()) as {
    name?: string;
    examType?: TopicExamType;
    completed?: boolean;
    status?: "todo" | "progress" | "done";
    toggleSource?: string;
  };

  if (kind === "subject") {
    if (body.examType && !EXAM_TYPES.includes(body.examType)) {
      return NextResponse.json({ error: "Valid examType is required" }, { status: 400 });
    }

    const subject = await updateStudentSubject(id, studentId, {
      name: body.name,
      examType: body.examType,
    });
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ subject }, { status: 200 });
  }

  if (kind === "topic") {
    const topic = await updateStudentTopic(id, studentId, {
      name: body.name,
      completed: body.completed,
      status: body.status,
      toggleSource: body.toggleSource,
    });
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ topic }, { status: 200 });
  }

  return NextResponse.json({ error: "kind query must be subject or topic" }, { status: 400 });
});

export const DELETE = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const id = getResourceId(req);
  const kind = new URL(req.url).searchParams.get("kind");

  if (kind === "subject") {
    const deleted = await deleteStudentSubject(id, studentId);
    if (!deleted) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (kind === "topic") {
    const deleted = await deleteStudentTopic(id, studentId);
    if (!deleted) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json({ error: "kind query must be subject or topic" }, { status: 400 });
});
