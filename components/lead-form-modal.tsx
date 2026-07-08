"use client";

import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/components/status-badge";

export interface LeadFormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  deal_value: string;
  notes: string;
}

const STATUS_OPTIONS: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "closed_won",
  "closed_lost",
];

function toFormValues(lead?: Lead | null): LeadFormValues {
  return {
    name: lead?.name ?? "",
    company: lead?.company ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    status: lead?.status ?? "new",
    deal_value: lead?.deal_value != null ? String(lead.deal_value) : "",
    notes: lead?.notes ?? "",
  };
}

export function LeadFormModal({
  lead,
  title,
  submitLabel,
  onClose,
  onSubmit,
}: {
  lead?: Lead | null;
  title: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (values: LeadFormValues) => Promise<{ error?: string } | void>;
}) {
  const [values, setValues] = useState<LeadFormValues>(toFormValues(lead));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof LeadFormValues>(key: K, value: LeadFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) {
      setError("Name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await onSubmit(values);
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name *
            </label>
            <input
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="Jane Doe"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Company
              </label>
              <input
                value={values.company}
                onChange={(e) => update("company", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Deal value ($)
              </label>
              <input
                type="number"
                min="0"
                value={values.deal_value}
                onChange={(e) => update("deal_value", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                placeholder="10000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                placeholder="jane@acme.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                value={values.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                placeholder="555-0100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={values.status}
              onChange={(e) => update("status", e.target.value as LeadStatus)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              value={values.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="Context, next steps, anything useful..."
            />
          </div>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
