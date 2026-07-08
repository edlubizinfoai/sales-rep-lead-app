import type { LeadStatus } from "@/lib/types";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-slate-100 text-slate-700 ring-slate-500/20",
  contacted: "bg-blue-100 text-blue-700 ring-blue-600/20",
  qualified: "bg-purple-100 text-purple-700 ring-purple-600/20",
  closed_won: "bg-green-100 text-green-700 ring-green-600/20",
  closed_lost: "bg-red-100 text-red-700 ring-red-600/20",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function isStale(lastActivityAt: string | null): boolean {
  if (!lastActivityAt) return false;
  const days = (Date.now() - new Date(lastActivityAt).getTime()) / 86_400_000;
  return days > 7;
}
