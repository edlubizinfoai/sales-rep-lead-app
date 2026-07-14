"use client";

import { useState } from "react";
import type { Activity } from "@/lib/types";

const ACTIVITY_OPTIONS: Array<{ value: Activity["activity_type"]; label: string }> = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "note", label: "Note" },
];

export function LogActivityModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (values: {
    activity_type: Activity["activity_type"];
    notes: string;
  }) => Promise<{ error?: string } | void>;
}) {
  const [activityType, setActivityType] = useState<Activity["activity_type"]>("call");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await onSubmit({ activity_type: activityType, notes });
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Log Activity</h2>
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
            <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActivityType(opt.value)}
                  className={`rounded-md px-2 py-2 text-sm font-medium transition ${
                    activityType === opt.value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              autoFocus
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="What happened?"
            />
          </div>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
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
              {submitting ? "Logging…" : "Log Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
