"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Entitlement, Lead, LeadStatus } from "@/lib/types";
import { StatusBadge, isStale } from "@/components/status-badge";
import { ScoreBadge } from "@/components/score-badge";
import { LeadFormModal, type LeadFormValues } from "@/components/lead-form-modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { Toast, type ToastState } from "@/components/toast";

const FILTERS: Array<{ key: LeadStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "closed_won", label: "Won" },
  { key: "closed_lost", label: "Lost" },
];

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

export function LeadsApp({
  initialLeads,
  loadError,
  entitlement,
  userId,
}: {
  initialLeads: Lead[];
  loadError: string | null;
  entitlement: Entitlement;
  userId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => setLeads(initialLeads), [initialLeads]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  const visibleLeads =
    filter === "all" ? leads : leads.filter((l) => l.status === filter);

  const atLimit = !entitlement.isPro && entitlement.ownLeadCount >= entitlement.limit;

  async function handleAdd(values: LeadFormValues) {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(values)),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: body.message ?? body.error ?? "Failed to add lead" };
    }
    setShowAdd(false);
    setToast({ message: `Added ${body.lead.name}`, kind: "success" });
    refresh();
  }

  async function handleEditSubmit(values: LeadFormValues) {
    if (!editingLead) return;
    const res = await fetch(`/api/leads/${editingLead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(values)),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: body.message ?? body.error ?? "Failed to update lead" };
    }
    setEditingLead(null);
    setToast({ message: `Updated ${body.lead.name}`, kind: "success" });
    refresh();
  }

  async function handleDelete() {
    if (!deletingLead) return;
    setDeleting(true);
    const res = await fetch(`/api/leads/${deletingLead.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (!res.ok) {
      setToast({ message: "Failed to delete lead", kind: "error" });
      return;
    }
    setToast({ message: `Deleted ${deletingLead.name}`, kind: "success" });
    setDeletingLead(null);
    refresh();
  }

  function handleAddClick() {
    if (!userId) {
      router.push("/login");
      return;
    }
    setShowAdd(true);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Leads
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track leads, see what&apos;s hot, act fast.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          {userId ? "+ Add Lead" : "Log in to add leads"}
        </button>
      </header>

      {atLimit && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">
            You&apos;ve hit the free plan limit of {entitlement.limit} leads. Upgrade
            for unlimited leads.
          </p>
          <Link
            href="/upgrade"
            className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-500"
          >
            Upgrade — $19/mo
          </Link>
        </div>
      )}

      {loadError && (
        <p className="mb-6 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Couldn&apos;t load leads: {loadError}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === f.key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div
        className={`space-y-3 transition-opacity ${isPending ? "opacity-50" : ""}`}
      >
        {isPending && leads.length === 0 && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        )}

        {!isPending && visibleLeads.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
            <p className="text-sm text-slate-500">
              {leads.length === 0
                ? "No leads yet — add your first one."
                : "No leads match this filter."}
            </p>
            {leads.length === 0 && (
              <button
                onClick={handleAddClick}
                className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                {userId ? "+ Add Lead" : "Log in to add leads"}
              </button>
            )}
          </div>
        )}

        {visibleLeads.map((lead) => {
          const isOwner = userId != null && lead.user_id === userId;
          return (
            <div
              key={lead.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="truncate font-semibold text-slate-900 hover:underline"
                  >
                    {lead.name}
                  </Link>
                  <StatusBadge status={lead.status} />
                  {lead.user_id == null && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-500/20">
                      Demo
                    </span>
                  )}
                  {isStale(lead.last_activity_at) && (
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                      Stale
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {lead.company || "—"}
                  {lead.deal_value != null && (
                    <> · ${Number(lead.deal_value).toLocaleString()}</>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <ScoreBadge score={lead.score} />
                {isOwner && (
                  <>
                    <button
                      onClick={() => setEditingLead(lead)}
                      className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingLead(lead)}
                      className="rounded-md px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <LeadFormModal
          title="Add Lead"
          submitLabel="Add Lead"
          onClose={() => setShowAdd(false)}
          onSubmit={handleAdd}
        />
      )}

      {editingLead && (
        <LeadFormModal
          lead={editingLead}
          title="Edit Lead"
          submitLabel="Save Changes"
          onClose={() => setEditingLead(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {deletingLead && (
        <ConfirmModal
          title="Delete lead?"
          message={`This will permanently remove ${deletingLead.name} from your leads.`}
          onCancel={() => setDeletingLead(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}

      <Toast toast={toast} />
    </main>
  );
}
