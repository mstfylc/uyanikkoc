import { NextResponse } from "next/server";
import { withMobileAuth } from "@/server/auth/withMobileAuth";
import { getSchedule } from "@/server/services/mobile-student.service";
import { mobileError } from "@/server/auth/mobile-http";

// GET /api/mobile/schedule → { days, daysFull, today, schedule }
export const GET = withMobileAuth(
  async () => {
    try {
      return NextResponse.json(getSchedule(), { status: 200 });
    } catch (err) {
      return mobileError(err);
    }
  },
  { role: "student" },
);
