import { NextResponse } from "next/server";

import { withApiAuth } from "@/lib/auth/api-guard";
import {
  cancelSubscription,
  getSubscriptionView,
  resumeSubscription,
  setAutoRenew,
  subscribe,
} from "@/server/services/billing.service";

const CYCLES = ["monthly", "annual"] as const;

export const GET = withApiAuth(["student", "parent"], async (_req, { session }) => {
  const view = await getSubscriptionView(session.user.id);
  return NextResponse.json(view, { status: 200 });
});

export const POST = withApiAuth(["student", "parent"], async (req, { session }) => {
  const body = (await req.json()) as {
    planId?: string;
    cycle?: string;
    paymentMethodId?: string | null;
    installments?: number;
    studentId?: string | null;
  };

  const planId = body.planId?.trim();
  const cycle = body.cycle as (typeof CYCLES)[number] | undefined;
  if (!planId) {
    return NextResponse.json({ error: "planId is required" }, { status: 400 });
  }
  if (!cycle || !CYCLES.includes(cycle)) {
    return NextResponse.json({ error: "cycle must be monthly|annual" }, { status: 400 });
  }

  try {
    const result = await subscribe({
      payerUserId: session.user.id,
      studentId: session.user.studentId ?? body.studentId ?? null,
      planId,
      cycle,
      paymentMethodId: body.paymentMethodId ?? null,
      installments: body.installments ?? 1,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "PLAN_NOT_FOUND") {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    throw error;
  }
});

export const PATCH = withApiAuth(["student", "parent"], async (req, { session }) => {
  const body = (await req.json()) as { action?: string; value?: boolean };
  const action = body.action;

  let subscription = null;
  if (action === "autoRenew") {
    subscription = await setAutoRenew(session.user.id, body.value ?? true);
  } else if (action === "cancel") {
    subscription = await cancelSubscription(session.user.id);
  } else if (action === "resume") {
    subscription = await resumeSubscription(session.user.id);
  } else {
    return NextResponse.json({ error: "action must be autoRenew|cancel|resume" }, { status: 400 });
  }

  if (!subscription) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }
  return NextResponse.json({ subscription }, { status: 200 });
});
