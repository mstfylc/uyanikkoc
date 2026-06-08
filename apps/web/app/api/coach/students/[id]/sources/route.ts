import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import type { SelfStudyKind, SourceStatus } from "@/mocks/student-sources";
import { coachHasStudent } from "@/server/services/roster.service";
import {
  addStudentSelfStudy,
  addStudentSource,
  getStudentSourceTracker,
  listStudentSources,
  removeStudentSelfStudy,
  removeStudentSource,
  updateStudentSource,
} from "@/server/services/student-sources.service";

const SOURCE_STATUSES = new Set<SourceStatus>(["beklemede", "aktif", "bitti"]);
const SELF_STUDY_KINDS = new Set<SelfStudyKind>(["cozdum", "calistim"]);

function getStudentId(req: Request): string {
  const segments = new URL(req.url).pathname.split("/").filter(Boolean);
  const studentsIndex = segments.indexOf("students");
  return studentsIndex >= 0 ? (segments[studentsIndex + 1] ?? "") : "";
}

async function assertStudent(req: Request, coachId: string): Promise<string | NextResponse> {
  const studentId = getStudentId(req);
  if (!studentId) {
    return NextResponse.json({ error: "Student id is required" }, { status: 400 });
  }
  if (!(await coachHasStudent(coachId, studentId))) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }
  return studentId;
}

export const GET = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }
  const studentId = await assertStudent(req, coachId);
  if (studentId instanceof NextResponse) return studentId;

  const sources = await listStudentSources(studentId);
  const tracker = await getStudentSourceTracker(studentId);
  return NextResponse.json({ sources, tracker }, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }
  const studentId = await assertStudent(req, coachId);
  if (studentId instanceof NextResponse) return studentId;

  const body = (await req.json()) as {
    action?: "selfStudy";
    label?: string;
    book?: string;
    kind?: SelfStudyKind;
    soru?: number;
    dogru?: number | null;
    subject?: string;
  };

  if (body.action === "selfStudy") {
    const book = body.book?.trim();
    if (!book || !body.kind || !SELF_STUDY_KINDS.has(body.kind)) {
      return NextResponse.json({ error: "valid self-study payload is required" }, { status: 400 });
    }
    const { tracker, selfStudy } = await addStudentSelfStudy(studentId, {
      book,
      kind: body.kind,
      soru: body.soru,
      dogru: body.dogru,
      subject: body.subject,
    });
    return NextResponse.json({ sources: tracker.items.map((item) => item.name), tracker, selfStudy }, { status: 201 });
  }

  const label = body.label?.trim();
  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }
  const sources = await addStudentSource(studentId, label);
  const tracker = await getStudentSourceTracker(studentId);
  return NextResponse.json({ sources, tracker }, { status: 201 });
});

export const PATCH = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }
  const studentId = await assertStudent(req, coachId);
  if (studentId instanceof NextResponse) return studentId;

  const body = (await req.json()) as { name?: string; status?: SourceStatus; progress?: number };
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (body.status && !SOURCE_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  const tracker = await updateStudentSource(studentId, name, {
    status: body.status,
    progress: body.progress,
  });
  return NextResponse.json({ sources: tracker.items.map((item) => item.name), tracker }, { status: 200 });
});

export const DELETE = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }
  const studentId = await assertStudent(req, coachId);
  if (studentId instanceof NextResponse) return studentId;

  const body = (await req.json()) as { action?: "selfStudy"; label?: string; id?: string };
  if (body.action === "selfStudy") {
    const id = body.id?.trim();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const { tracker, selfStudy } = await removeStudentSelfStudy(studentId, id);
    return NextResponse.json({ sources: tracker.items.map((item) => item.name), tracker, selfStudy }, { status: 200 });
  }

  const label = body.label?.trim();
  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }
  const sources = await removeStudentSource(studentId, label);
  const tracker = await getStudentSourceTracker(studentId);
  return NextResponse.json({ sources, tracker }, { status: 200 });
});
