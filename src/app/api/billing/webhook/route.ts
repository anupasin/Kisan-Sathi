import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/server";
import { PLAN } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook — the source of truth for payment state.
 * - Signature: HMAC-SHA256 of the RAW body with the webhook secret.
 * - Idempotency: event ids are recorded in razorpay_events; replays no-op.
 * - Always answers 200 quickly so Razorpay does not retry storms.
 */
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ received: true });
  }

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  if (
    expected.length !== signature.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          notes?: Record<string, string>;
        };
      };
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const service = getServiceClient();

  // Idempotency: first delivery wins, replays are acknowledged and skipped.
  const eventId = request.headers.get("x-razorpay-event-id");
  if (eventId) {
    const { error: dupError } = await service
      .from("razorpay_events")
      .insert({ event_id: eventId, payload: event });
    if (dupError) return NextResponse.json({ received: true, duplicate: true });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;

  if (event.event === "payment.captured" && orderId) {
    const now = new Date();
    const expires = new Date(now.getTime() + PLAN.days * 24 * 60 * 60 * 1000);
    await service
      .from("subscriptions")
      .update({
        status: "active",
        razorpay_payment_id: payment.id ?? null,
        starts_at: now.toISOString(),
        expires_at: expires.toISOString(),
      })
      .eq("razorpay_order_id", orderId)
      // Don't reset an already-active row's window on replayed captures.
      .neq("status", "active");
  } else if (event.event === "payment.failed" && orderId) {
    await service
      .from("subscriptions")
      .update({ status: "failed" })
      .eq("razorpay_order_id", orderId)
      .eq("status", "created");
  }

  return NextResponse.json({ received: true });
}
