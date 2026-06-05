import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  createUserSupportTicket,
  listUserSupportTickets,
} from "@/server/services/support.service";

export const GET = withApiAuth(
  ["student", "coach", "parent", "branch", "admin"],
  async (_req, { session }) => {
    const tickets = await listUserSupportTickets(session.user.id);
    return NextResponse.json({ tickets }, { status: 200 });
  },
);

export const POST = withApiAuth(
  ["student", "coach", "parent", "branch", "admin"],
  async (req, { session }) => {
    const body = (await req.json()) as { subject?: string; message?: string };
    if (!body.subject?.trim() || !body.message?.trim()) {
      return NextResponse.json({ error: "subject and message required" }, { status: 400 });
    }

    const ticket = await createUserSupportTicket({
      userId: session.user.id,
      role: session.user.role,
      subject: body.subject,
      message: body.message,
    });

    return NextResponse.json({ ticket }, { status: 200 });
  },
);
