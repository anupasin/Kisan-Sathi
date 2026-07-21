import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getUser } from "@/lib/dal";
import { getServiceClient } from "@/lib/supabase/server";
import { PLAN, billingConfigured } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

function fail(error: string, status = 200) {
  return NextResponse.json(
    { ok: false, data: null, source: "none", fallbackUsed: false, error },
    { status },
  );
}

/**
 * Instant-UX activation after Checkout succeeds: verifies the client-supplied
 * payment signature and activates the subscription. The webhook remains the
 * source of truth and is idempotent with this route.
 */
export async function POST(request: Request) {
  if (!billingConfigured()) return fail("billing_not_configured");

  const user = await getUser();
  if (!user) return fail("auth_required", 401);

  let body;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return fail("bad_request", 400);
  }

  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
    .digest("hex");
  const given = body.razorpay_signature;
  if (
    expected.length !== given.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(given))
  ) {
    return fail("bad_signature", 400);
  }

  const service = getServiceClient();
  const now = new Date();
  const expires = new Date(now.getTime() + PLAN.days * 24 * 60 * 60 * 1000);
  const { error } = await service
    .from("subscriptions")
    .update({
      status: "active",
      razorpay_payment_id: body.razorpay_payment_id,
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
    })
    .eq("razorpay_order_id", body.razorpay_order_id)
    .eq("user_id", user.id);
  if (error) return fail("activation_failed");

  return NextResponse.json({
    ok: true,
    data: { active: true },
    source: "razorpay",
    fallbackUsed: false,
  });
}
