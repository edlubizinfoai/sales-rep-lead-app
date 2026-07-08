import { createClient } from "@/lib/supabase/server";
import { getVisitorIdReadOnly } from "@/lib/visitor";
import { getEntitlement } from "@/lib/leads/entitlement";
import { LeadsApp } from "@/components/leads-app";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const visitorId = await getVisitorIdReadOnly();

  const [{ data: leads, error }, entitlement] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    getEntitlement(supabase, visitorId),
  ]);

  return (
    <LeadsApp
      initialLeads={(leads as Lead[]) ?? []}
      loadError={error?.message ?? null}
      entitlement={entitlement}
    />
  );
}
