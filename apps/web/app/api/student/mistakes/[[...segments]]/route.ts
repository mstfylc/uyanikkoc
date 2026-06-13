import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { toMistakeContract } from "@/lib/contracts/web-v6";
import {
  createStudentMistake,
  createStudentMistakeBatch,
  deleteStudentMistake,
  listStudentMistakes,
  reviewStudentMistake,
  updateStudentMistake,
  type StudentMistakeInput,
  type StudentMistakePatch,
} from "@/server/services/mistake.service";

function studentIdOrResponse(studentId?: string | null) {
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }
  return studentId;
}

function segmentsFromUrl(url: string): string[] {
  const pathname = new URL(url).pathname;
  const rest = pathname.replace(/^\/api\/student\/mistakes\/?/, "");
  return rest ? rest.split("/").filter(Boolean) : [];
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Yanlis Defteri request failed";
  const status = message.includes("Database is required") ? 503 : 400;
  return NextResponse.json({ error: message }, { status });
}

export const GET = withApiAuth(["student"], async (req, { session }) => {
  const studentId = studentIdOrResponse(session.user.studentId);
  if (studentId instanceof NextResponse) return studentId;

  const segments = segmentsFromUrl(req.url);
  if (segments.length > 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const mistakes = await listStudentMistakes(studentId);
    return NextResponse.json(
      { mistakes, yanlislar: mistakes.map((item) => toMistakeContract(item, session.user.name)) },
      { status: 200 },
    );
  } catch (error) {
    return errorResponse(error);
  }
});

export const POST = withApiAuth(["student"], async (req, { session }) => {
  const studentId = studentIdOrResponse(session.user.studentId);
  if (studentId instanceof NextResponse) return studentId;

  const segments = segmentsFromUrl(req.url);
  const body = (await req.json()) as StudentMistakeInput | { items?: StudentMistakeInput[] };

  try {
    if (segments.length === 0) {
      const mistake = await createStudentMistake(studentId, body as StudentMistakeInput);
      return NextResponse.json(
        { mistake, yanlis: toMistakeContract(mistake, session.user.name) },
        { status: 201 },
      );
    }
    if (segments.length === 1 && segments[0] === "batch") {
      const mistakes = await createStudentMistakeBatch(studentId, (body as { items?: StudentMistakeInput[] }).items ?? []);
      return NextResponse.json(
        { mistakes, yanlislar: mistakes.map((item) => toMistakeContract(item, session.user.name)) },
        { status: 201 },
      );
    }
    if (segments.length === 2 && segments[1] === "review") {
      const mistake = await reviewStudentMistake(segments[0], studentId);
      if (!mistake) return NextResponse.json({ error: "Mistake not found" }, { status: 404 });
      return NextResponse.json(
        { mistake, yanlis: toMistakeContract(mistake, session.user.name) },
        { status: 200 },
      );
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
  }
});

export const PATCH = withApiAuth(["student"], async (req, { session }) => {
  const studentId = studentIdOrResponse(session.user.studentId);
  if (studentId instanceof NextResponse) return studentId;

  const segments = segmentsFromUrl(req.url);
  if (segments.length !== 1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const patch = (await req.json()) as StudentMistakePatch;
    const mistake = await updateStudentMistake(segments[0], studentId, patch);
    if (!mistake) return NextResponse.json({ error: "Mistake not found" }, { status: 404 });
    return NextResponse.json(
      { mistake, yanlis: toMistakeContract(mistake, session.user.name) },
      { status: 200 },
    );
  } catch (error) {
    return errorResponse(error);
  }
});

export const DELETE = withApiAuth(["student"], async (req, { session }) => {
  const studentId = studentIdOrResponse(session.user.studentId);
  if (studentId instanceof NextResponse) return studentId;

  const segments = segmentsFromUrl(req.url);
  if (segments.length !== 1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const deleted = await deleteStudentMistake(segments[0], studentId);
    if (!deleted) return NextResponse.json({ error: "Mistake not found" }, { status: 404 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
});
