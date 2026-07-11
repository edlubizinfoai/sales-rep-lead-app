"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Lead } from "@/lib/types";
import { StatusBadge, isStale } from "@/components/status-badge";
import { ScoreBadge } from "@/components/score-badge";
import { LeadFormModal, type LeadFormValues } from "@/components/lead-form-modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { Toast, type ToastState } from "@/components/toast";

function toPayload(values: LeadFormValues) {
  return {
    name: values.name.trim(),
    company: values.company.trim() || null,
    email: values.email.trim() || null,
    phone: values.phone.trim() || null,
    status: values.status,
    deal_value: values.deal_value === "" ? null : Number(values.deal_value),
    notes: values.notes.trim() || null,
  };
}

export function LeadDetail({ lead, isOwner }: { lead: Lead; isOwner: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(lead);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  async function handleEditSubmit(values: LeadFormValues) {
    const res = await fetch(`/api/leads/${current.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(values)),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: body.message ?? body.error ?? "Failed to update lead" };
    }
    setCurrent(body.lead);
    setEditing(false);
    setToast({ message: "Lead updated", kind: "success" });
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/leads/${current.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      setToast({ message: "Failed to delete lead", kind: "error" });
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ← Back to leads
      </Link>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{current.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{current.company || "—"}</p>
          </div>
          <div className="flex items-center gap-2">
            <ScoreBadge score={current.score} />
            <StatusBadge status={current.status} />
            {isStale(current.last_activity_at) && (
              <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                Stale
              </span>
            )}
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Email
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{current.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Phone
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{current.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Deal value
            </dt>
            <dd className="mt-1 text-sm text-slate-900">
              {current.deal_value != null
                ? `$${Number(current.deal_value).toLocaleString()}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Last activity
            </dt>
            <dd className="mt-1 text-sm text-slate-900">
              {current.last_activity_at
                ? new Date(current.last_activity_at).toLocaleDateString()
                : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Notes
          </dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
            {current.notes || "No notes yet."}
          </dd>
        </div>

        {isOwner ? (
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              onClick={() => setConfirmingDelete(true)}
              className="rounded-md px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              Delete
            </button>
            <button
              onClick={() => setEditing(true)}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Edit
            </button>
          </div>
        ) : (
          <p className="mt-8 border-t border-slate-100 pt-6 text-sm text-slate-400">
            This is a shared demo lead — read-only.
          </p>
        )}
      </div>

      {editing && (
        <LeadFormModal
          lead={current}
          title="Edit Lead"
          submitLabel="Save Changes"
          onClose={() => setEditing(false)}
          onSubmit={handleEditSubmit}
        />
      )}

      {confirmingDelete && (
        <ConfirmModal
          title="Delete lead?"
          message={`This will permanently remove ${current.name} from your leads.`}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}

      <Toast toast={toast} />
    </main>
  );
}
