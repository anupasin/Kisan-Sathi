/**
 * Single source of truth for the admin allowlist.
 *
 * Admins get full premium / unlimited scans forever, with no subscription
 * record required. Enforcement lives in the `is_admin()` / `is_premium()`
 * Postgres functions (see migration `admin_bypass_in_is_premium`); this module
 * mirrors that list for TypeScript that needs to know without a DB round-trip
 * (e.g. the logged-in UI badge). Keep the two in sync.
 */
export const ADMIN_EMAILS = ["birupia@gmail.com"] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase());
}
