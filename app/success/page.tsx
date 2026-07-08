import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getVisitorIdReadOnly } from "@/lib/visitor";

export const dynamic = "force-dynamic";

export default async function SuccessPage() {
  const supabase = await createClient();
  const visitorId = await getVisitorIdReadOnly();

  const { data: sub } = visitorId
    ? await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", visitorId)
        .eq("status", "active")
        .maybeSingle()
    : { data: null };

  const unlocked = !!sub;

  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          {unlocked ? "You're on Pro!" : "Payment received"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {unlocked
            ? "Unlimited leads are unlocked. Head back and keep building your pipeline."
            : "Confirming your subscription — this usually takes just a few seconds. Refresh if it doesn't update shortly."}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Back to leads
        </Link>
      </div>
    </main>
  );
}
