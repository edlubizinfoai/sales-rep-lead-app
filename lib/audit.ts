import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAudit(
  supabase: SupabaseClient,
  entry: {
    user_id: string | null;
    table_name: string;
    record_id: string | null;
    action: string;
    payload?: unknown;
  },
) {
  const { error } = await supabase.from("audit_logs").insert({
    user_id: entry.user_id,
    table_name: entry.table_name,
    record_id: entry.record_id,
    action: entry.action,
    payload: entry.payload ?? null,
  });
  if (error) {
    console.error("[audit] failed to write audit log:", error.message);
  }
}
