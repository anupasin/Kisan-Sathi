import "server-only";

import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseServer } from "./supabase/server";

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

/** True when the user has an active, unexpired subscription. */
export const isPremium = cache(async (userId: string): Promise<boolean> => {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.rpc("is_premium", { uid: userId });
  if (error) return false;
  return data === true;
});
