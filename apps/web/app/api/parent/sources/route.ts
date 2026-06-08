import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { resolveStudentIdForParent } from "@/server/services/motivation.service";
import { getStudentSourceTracker, listStudentSources } from "@/server/services/student-sources.service";

export const GET = withApiAuth(["parent"], async (_req, { session }) => {
  const parentId = session.user.parentId;
  if (!parentId) {
    return NextResponse.json({ error: "Parent profile missing" }, { status: 400 });
  }

  const studentId = await resolveStudentIdForParent(parentId);
  if (!studentId) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const sources = await listStudentSources(studentId);
  const tracker = await getStudentSourceTracker(studentId);
  return NextResponse.json({ sources, tracker }, { status: 200 });
});
