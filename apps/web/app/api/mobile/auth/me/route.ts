import { NextResponse } from "next/server";

import { withMobileAuth } from "@/server/auth/withMobileAuth";

export const GET = withMobileAuth(
  async (_req, { user }) =>
    NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email ?? "",
          role: user.role,
          studentId: user.studentId ?? null,
        },
      },
      { status: 200 },
    ),
  { role: "student" },
);
