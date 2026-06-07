import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  createAnnouncement,
  listAnnouncements,
} from "@/server/services/announcement.service";

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });

  const announcements = await listAnnouncements(coachId);
  return NextResponse.json({ announcements }, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });

  const body = (await req.json()) as {
    title?: string;
    body?: string;
    audience?: string;
  };

  const title = body.title?.trim();
  const text = body.body?.trim();
  const audience = body.audience?.trim();
  if (!title || title.length < 3) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  if (!text || text.length < 5) {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }
  if (!audience) {
    return NextResponse.json({ error: "audience required" }, { status: 400 });
  }

  const announcement = await createAnnouncement({ coachId, title, body: text, audience });
  return NextResponse.json({ announcement }, { status: 201 });
});
