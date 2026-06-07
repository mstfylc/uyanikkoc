import { NextResponse } from "next/server";
import { withMobileAuth } from "@/server/auth/withMobileAuth";
import { getOdev } from "@/server/services/mobile-student.service";
import { mobileError } from "@/server/auth/mobile-http";

// GET /api/mobile/odev → { weeks, items }
export const GET = withMobileAuth(
  async () => {
    try {
      return NextResponse.json(getOdev(), { status: 200 });
    } catch (err) {
      return mobileError(err);
    }
  },
  { role: "student" },
);
