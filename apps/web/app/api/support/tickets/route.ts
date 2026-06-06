import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  closeTicket,
  createTicket,
  listMyTickets,
} from "@/server/services/support.service";

const CATEGORIES = ["teknik", "oneri", "hesap", "diger"] as const;

export const GET = withApiAuth(["student", "parent", "coach"], async (_req, { session }) => {
  const tickets = await listMyTickets(session.user.id);
  return NextResponse.json({ tickets }, { status: 200 });
});

export const POST = withApiAuth(["student", "parent", "coach"], async (req, { session }) => {
  const body = (await req.json()) as { category?: string; message?: string };
  const category = body.category as (typeof CATEGORIES)[number] | undefined;
  const message = body.message?.trim();
  if (!category || !CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }
  if (!message || message.length < 5) {
    return NextResponse.json({ error: "message too short" }, { status: 400 });
  }
  const ticket = await createTicket({
    userId: session.user.id,
    role: session.user.role,
    category,
    message,
  });
  return NextResponse.json({ ticket }, { status: 201 });
});

export const PATCH = withApiAuth(["student", "parent", "coach"], async (req, { session }) => {
  const body = (await req.json()) as { id?: string; action?: string };
  const id = body.id?.trim();
  if (!id || body.action !== "close") {
    return NextResponse.json({ error: "id and action=close required" }, { status: 400 });
  }
  const ticket = await closeTicket(session.user.id, id);
  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  return NextResponse.json({ ticket }, { status: 200 });
});
