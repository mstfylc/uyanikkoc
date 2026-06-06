import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { createGroupThread } from "@/server/services/message.service";

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) return NextResponse.json({ error: "Coach missing" }, { status: 400 });

  const body = (await req.json()) as { name?: string; memberUserIds?: string[] };
  if (!body.name?.trim() || !body.memberUserIds?.length) {
    return NextResponse.json({ error: "name + members required" }, { status: 400 });
  }

  const id = await createGroupThread(coachId, body.name.trim(), body.memberUserIds);
  return NextResponse.json({ id }, { status: 201 });
});
