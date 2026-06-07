import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getMessageThread, updateGroupMembers } from "@/server/services/message.service";

export const PATCH = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });

  const id = req.url.split("/groups/")[1]?.split("/")[0];
  const body = (await req.json()) as { memberUserIds?: string[] };
  if (!id || !body.memberUserIds) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  // Koç yalnızca kendi grubunun üyelerini değiştirebilir (ownership koruması).
  const thread = await getMessageThread(id);
  if (!thread || thread.kind !== "group" || thread.coachId !== coachId) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  try {
    await updateGroupMembers(id, body.memberUserIds);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
});
