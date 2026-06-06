import type { CoachTaskPriority } from "@uyanik/database";
import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  createCoachTask,
  deleteCoachTask,
  listCoachTasks,
  setCoachTaskDone,
} from "@/server/services/coach-task.service";
import { coachHasStudent } from "@/server/services/roster.service";

const PRIORITIES: CoachTaskPriority[] = ["high", "med", "low"];

export const GET = withApiAuth(["coach"], async (_req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });

  const tasks = await listCoachTasks(coachId);
  return NextResponse.json({ tasks }, { status: 200 });
});

export const POST = withApiAuth(["coach"], async (req, { session }) => {
  const coachId = session.user.coachId;
  if (!coachId) return NextResponse.json({ error: "Coach profile missing" }, { status: 400 });

  const body = (await req.json()) as {
    action?: "create" | "toggle" | "delete";
    id?: string;
    text?: string;
    studentId?: string | null;
    due?: string | null;
    priority?: CoachTaskPriority;
    done?: boolean;
  };

  const action = body.action ?? "create";

  if (action === "toggle") {
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const task = await setCoachTaskDone(coachId, body.id, body.done !== false);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json({ task }, { status: 200 });
  }

  if (action === "delete") {
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const ok = await deleteCoachTask(coachId, body.id);
    if (!ok) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const text = body.text?.trim();
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  const priority = body.priority && PRIORITIES.includes(body.priority) ? body.priority : "med";

  const studentId = body.studentId?.trim() || null;
  if (studentId && !(await coachHasStudent(coachId, studentId))) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const due = body.due?.trim() || null;
  const task = await createCoachTask({ coachId, studentId, text, due, priority });
  return NextResponse.json({ task }, { status: 201 });
});
