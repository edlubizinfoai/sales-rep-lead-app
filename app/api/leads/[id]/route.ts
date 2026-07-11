import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeScore } from "@/lib/leads/score";
import { logAudit } from "@/lib/audit";

const EDITABLE_FIELDS = [
  "name",
  "company",
  "email",
  "phone",
  "status",
  "deal_value",
  "notes",
  "last_activity_at",
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "unauthenticated", message: "Log in to edit leads." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));

    const { data: existing, error: fetchError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to edit this lead." },
        { status: 403 },
      );
    }

    const updates: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in body) updates[field] = body[field];
    }
    if ("deal_value" in updates) {
      updates.deal_value =
        updates.deal_value === "" || updates.deal_value == null
          ? null
          : Number(updates.deal_value);
    }

    const merged = { ...existing, ...updates };
    const { score, confidence } = computeScore({
      status: merged.status,
      deal_value: merged.deal_value,
      last_activity_at: merged.last_activity_at,
    });
    updates.score = score;
    updates.score_source = "rule-based";
    updates.score_confidence = confidence;

    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAudit(supabase, {
      user_id: user.id,
      table_name: "leads",
      record_id: id,
      action: "update",
      payload: { before: existing, after: data },
    });

    return NextResponse.json({ lead: data });
  } catch (err) {
    console.error("[api/leads/:id PATCH]", err);
    return NextResponse.json(
      { error: "Could not reach the database. Try again shortly." },
      { status: 503 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "unauthenticated", message: "Log in to delete leads." },
        { status: 401 },
      );
    }

    const { data: existing } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this lead." },
        { status: 403 },
      );
    }

    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAudit(supabase, {
      user_id: user.id,
      table_name: "leads",
      record_id: id,
      action: "delete",
      payload: { before: existing },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/leads/:id DELETE]", err);
    return NextResponse.json(
      { error: "Could not reach the database. Try again shortly." },
      { status: 503 },
    );
  }
}
