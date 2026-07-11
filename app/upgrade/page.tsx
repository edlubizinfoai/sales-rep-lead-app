"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FEATURES = [
  "Unlimited leads",
  "Full status workflow + lead scoring",
  "Priority support",
];

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Checkout is not available yet.");
        setLoading(false);
        return;
      }
      window.location.href = body.url;
    } catch {
      setError("Something went wrong starting checkout.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ← Back to leads
      </Link>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Upgrade to Pro</h1>
        <p className="mt-2 text-4xl font-extrabold text-slate-900">
          $19<span className="text-base font-medium text-slate-500">/mo</span>
        </p>

        <ul className="mt-6 space-y-2 text-left text-sm text-slate-700">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span> {f}
            </li>
          ))}
        </ul>

        {error && (
          <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-8 w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Upgrade with Stripe"}
        </button>
      </div>
    </main>
  );
}
