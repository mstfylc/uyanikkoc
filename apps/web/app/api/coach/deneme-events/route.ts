import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  createDenemeEvent,
  getCoachDenemeContext,
  removeDenemeEvent,
} from "@/server/services/deneme-events.service";
import type { DenemeExamType } from "@/mocks/deneme-events";

const TYPES: DenemeExamType[] = ["TYT", "AYT", "LGS"];

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }
  const ctx = await getCoachDenemeContext(coachId);
  return NextResponse.json(ctx, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as {
    name?: string;
    examType?: DenemeExamType;
    date?: string;
    time?: string;
    place?: string;
    questionCount?: number;
    price?: number;
  };

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  if (!body.examType || !TYPES.includes(body.examType)) {
    return NextResponse.json({ error: "invalid examType" }, { status: 400 });
  }
  if (!body.date?.trim()) {
    return NextResponse.json({ error: "date required" }, { status: 400 });
  }

  const event = await createDenemeEvent(coachId, {
    name,
    examType: body.examType,
    date: body.date,
    time: body.time?.trim() || "10:00",
    place: body.place?.trim() || "Kampüs Koç · Kadıköy",
    questionCount: Number(body.questionCount) || 120,
    price: Number(body.price) || 150,
  });

  return NextResponse.json({ event }, { status: 201 });
});

export const DELETE = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) {
    return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { eventId?: string };
  if (!body.eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }

  const ok = await removeDenemeEvent(coachId, body.eventId);
  if (!ok) {
    return NextResponse.json({ error: "Deneme bulunamadı" }, { status: 404 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
});
