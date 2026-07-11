import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeScore } from "@/lib/leads/score";
import { getEntitlement } from "@/lib/leads/entitlement";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ leads: data });
  } catch (err) {
    console.error("[api/leads GET]", err);
    return NextResponse.json(
      { error: "Could not reach the database. Try again shortly." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "unauthenticated", message: "Log in to add leads." },
        { status: 401 },
      );
    }

    const entitlement = await getEntitlement(supabase, user.id);
    if (!entitlement.isPro && entitlement.ownLeadCount >= entitlement.limit) {
      return NextResponse.json(
        {
          error: "upgrade_required",
          message: "Free tier limit reached. Upgrade to add more leads.",
        },
        { status: 402 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const status = typeof body.status === "string" ? body.status : "new";
    const deal_value =
      body.deal_value != null && body.deal_value !== ""
        ? Number(body.deal_value)
        : null;
    const last_activity_at = body.last_activity_at ?? new Date().toISOString();

    const { score, confidence } = computeScore({ status, deal_value, last_activity_at });

    const { data, error } = await supabase
      .from("leads")
      .insert({
        user_id: user.id,
        name,
        company: body.company || null,
        email: body.email || null,
        phone: body.phone || null,
        status,
        deal_value,
        notes: body.notes || null,
        last_activity_at,
        score,
        score_source: "rule-based",
        score_confidence: confidence,
        score_review_status: "unreviewed",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAudit(supabase, {
      user_id: user.id,
      table_name: "leads",
      record_id: data.id,
      action: "insert",
      payload: { after: data },
    });

    return NextResponse.json({ lead: data }, { status: 201 });
  } catch (err) {
    console.error("[api/leads POST]", err);
    return NextResponse.json(
      { error: "Could not reach the database. Try again shortly." },
      { status: 503 },
    );
  }
}
