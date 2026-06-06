import { NextResponse } from "next/server";

import type { DenemeMembershipId } from "@/lib/design/deneme-plans";
import { withApiAuth } from "@/lib/auth/api-guard";
import { resolveStudentIdForParent } from "@/server/services/motivation.service";
import {
  getStudentDenemeMembership,
  setStudentDenemeMembership,
} from "@/server/services/deneme-events.service";

async function resolveStudentId(session: {
  user: { role: string; studentId?: string | null; parentId?: string | null };
}): Promise<string | null> {
  if (session.user.role === "parent") {
    const parentId = session.user.parentId;
    if (!parentId) return null;
    return resolveStudentIdForParent(parentId);
  }
  return session.user.studentId ?? null;
}

export const GET = withApiAuth(["student", "parent"], async (_req, { session }) => {
  const studentId = await resolveStudentId(session);
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }
  const membership = await getStudentDenemeMembership(studentId);
  return NextResponse.json({ membership }, { status: 200 });
});

export const PUT = withApiAuth(["student", "parent"], async (req, { session }) => {
  const studentId = await resolveStudentId(session);
  if (!studentId) {
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });
  }

  const body = (await req.json()) as { planId?: DenemeMembershipId | null };
  const membership = await setStudentDenemeMembership(studentId, body.planId ?? null);
  return NextResponse.json({ membership }, { status: 200 });
});
