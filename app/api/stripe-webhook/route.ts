import { NextResponse } from "next/server";
import { stripe, constructWebhookEvent } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import type Stripe from "stripe";

/**
 * Register in Stripe dashboard → Webhooks → add endpoint → /api/stripe-webhook
 * Required events: checkout.session.completed, customer.subscription.updated,
 * customer.subscription.deleted
 *
 * Uses the service_role client, not the cookie-based one — a webhook call has
 * no logged-in user session for RLS to check against, only a verified Stripe
 * signature, so it must bypass RLS deliberately here.
 */
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(payload, signature);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.userId;
        if (!userId) break;

        let currentPeriodEnd: string | null = null;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );
          currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
        }

        const { data: subRow } = await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            stripe_checkout_session_id: session.id,
            plan: "pro",
            status: "active",
            current_period_end: currentPeriodEnd,
          })
          .select()
          .single();

        await logAudit(supabase, {
          user_id: userId,
          table_name: "subscriptions",
          record_id: subRow?.id ?? null,
          action: "payment_received",
          payload: { session_id: session.id },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({
            status: sub.status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe-webhook] error handling ${event.type}:`, err);
  }

  return NextResponse.json({ received: true });
}
