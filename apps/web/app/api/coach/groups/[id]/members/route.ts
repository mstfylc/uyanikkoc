import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { updateGroupMembers } from "@/server/services/message.service";

export const PATCH = withApiAuth(["coach"], async (req) => {
  const id = req.url.split("/groups/")[1]?.split("/")[0];
  const body = (await req.json()) as { memberUserIds?: string[] };
  if (!id || !body.memberUserIds) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    await updateGroupMembers(id, body.memberUserIds);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
});
