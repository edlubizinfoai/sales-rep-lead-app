import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeScore } from "@/lib/leads/score";
import { logAudit } from "@/lib/audit";

const ACTIVITY_TYPES = ["call", "email", "meeting", "note"] as const;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "unauthenticated", message: "Log in to log activity." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const lead_id = typeof body.lead_id === "string" ? body.lead_id : "";
    const activity_type = ACTIVITY_TYPES.includes(body.activity_type)
      ? body.activity_type
      : null;

    if (!lead_id || !activity_type) {
      return NextResponse.json(
        { error: "lead_id and a valid activity_type are required" },
        { status: 400 },
      );
    }

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    if (lead.user_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to log activity on this lead." },
        { status: 403 },
      );
    }

    const occurred_at = new Date().toISOString();
    const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;

    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .insert({
        user_id: user.id,
        lead_id,
        activity_type,
        notes,
        occurred_at,
      })
      .select()
      .single();

    if (activityError) {
      return NextResponse.json({ error: activityError.message }, { status: 500 });
    }

    await logAudit(supabase, {
      user_id: user.id,
      table_name: "activities",
      record_id: activity.id,
      action: "insert",
      payload: { after: activity },
    });

    const { score, confidence } = computeScore({
      status: lead.status,
      deal_value: lead.deal_value,
      last_activity_at: occurred_at,
    });

    const { data: updatedLead, error: updateError } = await supabase
      .from("leads")
      .update({
        last_activity_at: occurred_at,
        score,
        score_source: "rule-based",
        score_confidence: confidence,
      })
      .eq("id", lead_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await logAudit(supabase, {
      user_id: user.id,
      table_name: "leads",
      record_id: lead_id,
      action: "update",
      payload: { before: lead, after: updatedLead },
    });

    return NextResponse.json({ activity, lead: updatedLead }, { status: 201 });
  } catch (err) {
    console.error("[api/activities POST]", err);
    return NextResponse.json(
      { error: "Could not reach the database. Try again shortly." },
      { status: 503 },
    );
  }
}
