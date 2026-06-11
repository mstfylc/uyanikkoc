import { NextResponse } from "next/server";
import { withMobileAuth } from "@/server/auth/withMobileAuth";
import { getExams } from "@/server/services/mobile-student.service";
import { mobileError } from "@/server/auth/mobile-http";

// GET /api/mobile/exams → { exams, trend, upcoming }
export const GET = withMobileAuth(
  async (_req, { user }) => {
    try {
      return NextResponse.json(await getExams(user.studentId ?? undefined), { status: 200 });
    } catch (err) {
      return mobileError(err);
    }
  },
  { role: "student" },
);
