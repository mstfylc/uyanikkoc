import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  addPaymentMethod,
  listPaymentMethods,
  removePaymentMethod,
  setDefaultPaymentMethod,
} from "@/server/services/billing.service";

const BRANDS = ["visa", "mastercard"] as const;

export const GET = withApiAuth(["student", "parent"], async (_req, { session }) => {
  const methods = await listPaymentMethods(session.user.id);
  return NextResponse.json({ methods }, { status: 200 });
});

export const POST = withApiAuth(["student", "parent"], async (req, { session }) => {
  const body = (await req.json()) as {
    brand?: string;
    last4?: string;
    holder?: string;
    expMonth?: number;
    expYear?: number;
    makeDefault?: boolean;
  };

  const brand = body.brand as (typeof BRANDS)[number] | undefined;
  const last4 = body.last4?.trim();
  const holder = body.holder?.trim();
  if (!brand || !BRANDS.includes(brand)) {
    return NextResponse.json({ error: "invalid brand" }, { status: 400 });
  }
  if (!last4 || last4.length !== 4) {
    return NextResponse.json({ error: "last4 must be 4 digits" }, { status: 400 });
  }
  if (!holder) {
    return NextResponse.json({ error: "holder is required" }, { status: 400 });
  }
  if (!body.expMonth || !body.expYear) {
    return NextResponse.json({ error: "exp required" }, { status: 400 });
  }

  const method = await addPaymentMethod({
    userId: session.user.id,
    brand,
    last4,
    holder,
    expMonth: body.expMonth,
    expYear: body.expYear,
    makeDefault: body.makeDefault,
  });
  return NextResponse.json({ method }, { status: 201 });
});

export const PATCH = withApiAuth(["student", "parent"], async (req, { session }) => {
  const body = (await req.json()) as { id?: string };
  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const ok = await setDefaultPaymentMethod(session.user.id, id);
  if (!ok) {
    return NextResponse.json({ error: "Method not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
});

export const DELETE = withApiAuth(["student", "parent"], async (req, { session }) => {
  const body = (await req.json().catch(() => ({}))) as { id?: string };
  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const ok = await removePaymentMethod(session.user.id, id);
  if (!ok) {
    return NextResponse.json({ error: "Method not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
});
