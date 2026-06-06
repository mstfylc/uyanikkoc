import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { getCoachRevenueView } from "@/mocks/coach-revenue";

export const GET = withApiAuth(["coach"], async () => {
  const view = await getCoachRevenueView();
  return NextResponse.json(view, { status: 200 });
});
