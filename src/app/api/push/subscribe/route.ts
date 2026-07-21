import { NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/dal";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SubSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

function fail(error: string, status = 200) {
  return NextResponse.json(
    { ok: false, data: null, source: "none", fallbackUsed: false, error },
    { status },
  );
}

/** Save (upsert) the browser's push subscription for the signed-in user. */
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return fail("auth_required", 401);

  let sub;
  try {
    sub = SubSchema.parse(await request.json());
  } catch {
    return fail("bad_request", 400);
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      user_agent: request.headers.get("user-agent"),
    },
    { onConflict: "endpoint" },
  );
  if (error) return fail("subscribe_failed");

  return NextResponse.json({
    ok: true,
    data: { subscribed: true },
    source: "none",
    fallbackUsed: false,
  });
}

/** Remove a push subscription (browser unsubscribed or user opted out). */
export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return fail("auth_required", 401);

  let body: { endpoint?: string };
  try {
    body = (await request.json()) as { endpoint?: string };
  } catch {
    return fail("bad_request", 400);
  }
  if (!body.endpoint) return fail("bad_request", 400);

  const supabase = await getSupabaseServer();
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", body.endpoint);

  return NextResponse.json({
    ok: true,
    data: { subscribed: false },
    source: "none",
    fallbackUsed: false,
  });
}
