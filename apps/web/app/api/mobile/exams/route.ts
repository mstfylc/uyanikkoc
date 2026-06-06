import { NextResponse } from "next/server";
import { withMobileAuth } from "@/server/auth/withMobileAuth";
import { getExams } from "@/server/services/mobile-student.service";
import { mobileError } from "@/server/auth/mobile-http";

// GET /api/mobile/exams → { exams, trend, upcoming }
export const GET = withMobileAuth(
  async () => {
    try {
      return NextResponse.json(getExams(), { status: 200 });
    } catch (err) {
      return mobileError(err);
    }
  },
  { role: "student" },
);
