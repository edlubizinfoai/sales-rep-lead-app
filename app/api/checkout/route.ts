import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getVisitorId } from "@/lib/visitor";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json(
      { error: "Stripe is not configured yet." },
      { status: 503 },
    );
  }

  try {
    const visitorId = await getVisitorId();
    const origin =
      request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      client_reference_id: visitorId,
      metadata: { visitorId },
      subscription_data: { metadata: { visitorId } },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade?checkout=canceled`,
    });

    const supabase = await createClient();
    await logAudit(supabase, {
      user_id: visitorId,
      table_name: "subscriptions",
      record_id: null,
      action: "checkout_started",
      payload: { session_id: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[api/checkout]", err);
    return NextResponse.json(
      { error: "Could not start checkout. Try again shortly." },
      { status: 503 },
    );
  }
}
