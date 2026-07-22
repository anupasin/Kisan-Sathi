import "server-only";

export const PLAN = {
  id: "annual_399",
  amountPaise: 39_900,
  currency: "INR",
  days: 365,
} as const;

export function billingConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
