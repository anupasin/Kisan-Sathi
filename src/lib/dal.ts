import "server-only";

import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseServer } from "./supabase/server";
import { isAdminEmail } from "./admin";

/**
 * Data-access layer for auth. Per Next.js 16 guidance, the proxy only does
 * optimistic redirects — every real check goes through here, which validates
 * the JWT against Supabase (auth.getUser), not just the cookie.
 */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** True when the signed-in user is on the admin allowlist. */
export const isAdmin = cache(async (): Promise<boolean> => {
  const user = await getUser();
  return isAdminEmail(user?.email);
});

/**
 * True when the user has an active subscription — or is an admin (unlimited,
 * no subscription needed). The `is_premium` RPC already ORs in the admin
 * allowlist server-side; the local check is a fast, DB-independent backstop so
 * an admin is never gated even if the RPC is unavailable.
 */
export const isPremium = cache(async (userId: string): Promise<boolean> => {
  if (await isAdmin()) return true;
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.rpc("is_premium", { uid: userId });
  if (error) return false;
  return data === true;
});
