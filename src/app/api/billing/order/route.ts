import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getUser } from "@/lib/dal";
import { getServiceClient } from "@/lib/supabase/server";
import { PLAN, billingConfigured } from "@/lib/billing";
import type { ApiResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type OrderData = { orderId: string; amount: number; keyId: string };

function fail(error: string, status = 200) {
  return NextResponse.json(
    { ok: false, data: null, source: "none", fallbackUsed: false, error },
    { status },
  );
}

/** Creates a Razorpay order for the annual plan + a pending subscription row. */
export async function POST() {
  if (!billingConfigured()) return fail("billing_not_configured");

  const user = await getUser();
  if (!user) return fail("auth_required", 401);

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: PLAN.amountPaise,
      currency: PLAN.currency,
      notes: { user_id: user.id, plan: PLAN.id },
    });

    const service = getServiceClient();
    const { error } = await service.from("subscriptions").insert({
      user_id: user.id,
      plan: PLAN.id,
      status: "created",
      razorpay_order_id: order.id,
      amount_paise: PLAN.amountPaise,
    });
    if (error) return fail("order_store_failed");

    return NextResponse.json({
      ok: true,
      data: {
        orderId: order.id,
        amount: PLAN.amountPaise,
        keyId: process.env.RAZORPAY_KEY_ID!,
      },
      source: "razorpay",
      fallbackUsed: false,
    } satisfies ApiResult<OrderData>);
  } catch {
    return fail("order_create_failed");
  }
}
