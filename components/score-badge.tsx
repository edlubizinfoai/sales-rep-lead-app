export function ScoreBadge({ score }: { score: number | null }) {
  const value = score ?? 0;
  const color =
    value >= 70
      ? "bg-emerald-100 text-emerald-800 ring-emerald-600/20"
      : value >= 40
        ? "bg-amber-100 text-amber-800 ring-amber-600/20"
        : "bg-rose-100 text-rose-800 ring-rose-600/20";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${color}`}
      title="Lead score (rule-based, 0-100)"
    >
      {score == null ? "—" : Math.round(value)}
    </span>
  );
}
