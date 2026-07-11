import { createClient } from "@/lib/supabase/server";
import { LeadDetail } from "@/components/lead-detail";
import type { Lead } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (!lead) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Lead not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          It may have been deleted.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Back to leads
        </Link>
      </main>
    );
  }

  return <LeadDetail lead={lead as Lead} isOwner={user?.id === lead.user_id} />;
}
