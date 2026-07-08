import Stripe from "stripe";

// Falls back to a placeholder so `new Stripe()` doesn't throw at build time
// when STRIPE_SECRET_KEY isn't configured yet. Real Stripe calls still
// require a valid key at runtime.
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder_build_only",
  {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  },
);

export function constructWebhookEvent(payload: string, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );
}
