import { createClient } from "@/lib/supabase/server";
import { getEntitlement } from "@/lib/leads/entitlement";
import { LeadsApp } from "@/components/leads-app";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: leads, error }, entitlement] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    getEntitlement(supabase, user?.id ?? null),
  ]);

  return (
    <LeadsApp
      initialLeads={(leads as Lead[]) ?? []}
      loadError={error?.message ?? null}
      entitlement={entitlement}
      userId={user?.id ?? null}
    />
  );
}
