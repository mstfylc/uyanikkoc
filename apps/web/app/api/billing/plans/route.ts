import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { listPlans } from "@/server/services/billing.service";

export const GET = withApiAuth(["student", "parent", "coach"], async () => {
  const plans = await listPlans();
  return NextResponse.json({ plans }, { status: 200 });
});
