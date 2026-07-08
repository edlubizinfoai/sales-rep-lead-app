import type { LeadStatus } from "@/lib/types";

// Deterministic rule-based scoring — no AI involved. Keeps the core lead
// tracker fully functional with the intelligence layer switched off.
const STATUS_BASE: Record<LeadStatus, number> = {
  new: 20,
  contacted: 40,
  qualified: 65,
  closed_won: 100,
  closed_lost: 0,
};

const MAX_DEAL_VALUE_POINTS = 20;
const DEAL_VALUE_DIVISOR = 1000;

export function computeScore(input: {
  status: string;
  deal_value: number | null;
  last_activity_at: string | null;
}): { score: number; confidence: number } {
  const status = (input.status as LeadStatus) in STATUS_BASE
    ? (input.status as LeadStatus)
    : "new";

  if (status === "closed_won") return { score: 100, confidence: 1 };
  if (status === "closed_lost") return { score: 0, confidence: 1 };

  const base = STATUS_BASE[status];
  const dealComponent = Math.min(
    MAX_DEAL_VALUE_POINTS,
    (input.deal_value ?? 0) / DEAL_VALUE_DIVISOR,
  );

  let recencyComponent = -10;
  if (input.last_activity_at) {
    const days =
      (Date.now() - new Date(input.last_activity_at).getTime()) / 86_400_000;
    if (days <= 1) recencyComponent = 15;
    else if (days <= 3) recencyComponent = 10;
    else if (days <= 7) recencyComponent = 5;
    else if (days <= 14) recencyComponent = 0;
    else recencyComponent = -10;
  }

  const score = Math.max(
    0,
    Math.min(100, Math.round(base + dealComponent + recencyComponent)),
  );

  return { score, confidence: 0.8 };
}
