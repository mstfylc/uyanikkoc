import type { TopicExamType } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  createStudentSubject,
  createStudentTopic,
  listStudentTopics,
} from "@/server/services/topic.service";

const EXAM_TYPES: TopicExamType[] = ["TYT", "AYT", "LGS", "GENEL"];

type CreateSubjectBody = {
  kind: "subject";
  examType?: TopicExamType;
  name?: string;
};

type CreateTopicBody = {
  kind: "topic";
  subjectId?: string;
  name?: string;
};

export const GET = withApiAuth(["student"], async (_req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const result = await listStudentTopics(studentId);
  return NextResponse.json(result, { status: 200 });
});

export const POST = withApiAuth(["student"], async (req, { session }) => {
  const studentId = session.user.studentId;
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as CreateSubjectBody | CreateTopicBody;

  if (body.kind === "subject") {
    const name = body.name?.trim();
    const examType = body.examType;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!examType || !EXAM_TYPES.includes(examType)) {
      return NextResponse.json({ error: "Valid examType is required" }, { status: 400 });
    }

    const subject = await createStudentSubject({ studentId, examType, name });
    return NextResponse.json({ subject }, { status: 200 });
  }

  if (body.kind === "topic") {
    const name = body.name?.trim();
    const subjectId = body.subjectId;

    if (!name || !subjectId) {
      return NextResponse.json({ error: "subjectId and name are required" }, { status: 400 });
    }

    const topic = await createStudentTopic({ subjectId, studentId, name });
    if (!topic) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ topic }, { status: 200 });
  }

  return NextResponse.json({ error: "kind must be subject or topic" }, { status: 400 });
});
