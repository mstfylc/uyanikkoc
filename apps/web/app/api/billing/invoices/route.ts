import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import { listInvoices } from "@/server/services/billing.service";

export const GET = withApiAuth(["student", "parent"], async (_req, { session }) => {
  const invoices = await listInvoices(session.user.id);
  return NextResponse.json({ invoices }, { status: 200 });
});
