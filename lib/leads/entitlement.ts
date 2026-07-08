import type { SupabaseClient } from "@supabase/supabase-js";
import type { Entitlement } from "@/lib/types";

export const FREE_LEAD_LIMIT = 3;

export async function getEntitlement(
  supabase: SupabaseClient,
  visitorId: string | null,
): Promise<Entitlement> {
  if (!visitorId) {
    return { isPro: false, ownLeadCount: 0, remaining: FREE_LEAD_LIMIT, limit: FREE_LEAD_LIMIT };
  }

  const [{ count: ownLeadCount }, { data: sub }] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", visitorId),
    supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", visitorId)
      .eq("status", "active")
      .maybeSingle(),
  ]);

  const isPro = !!sub;
  const count = ownLeadCount ?? 0;

  return {
    isPro,
    ownLeadCount: count,
    remaining: isPro ? Infinity : Math.max(0, FREE_LEAD_LIMIT - count),
    limit: FREE_LEAD_LIMIT,
  };
}
