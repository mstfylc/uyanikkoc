// Admin anlık görüntü (snapshot) — kurum/franchise + süper admin + kuruma bağlı koç.
// apps/web/app/api/admin/snapshot/route.ts

import { NextResponse } from "next/server";

import { snapshotContextFromSession } from "@/lib/admin/snapshot-context";
import { withApiAuth } from "@/lib/auth/api-guard";
import { getAdminSnapshot } from "@/server/services/admin.service";

export const GET = withApiAuth(["admin", "branch", "coach"], async (_req, { session }) => {
  const snapshot = await getAdminSnapshot(snapshotContextFromSession(session.user));
  return NextResponse.json(snapshot, { status: 200 });
});
