import type { LeadStatus } from "@/lib/types";

// Deterministic rule-based scoring — no AI involved. Keeps the core lead
// tracker fully functional with the intelligence layer switched off.
// Weights match docs/INTELLIGENCE_LAYER.md exactly.
const STATUS_WEIGHT: Partial<Record<LeadStatus, number>> = {
  new: 5,
  contacted: 15,
  qualified: 30,
};

export interface ScoreFactors {
  status_weight: number;
  deal_value_band: number;
  recency_days: number;
}

function dealValueBand(dealValue: number | null): number {
  const value = dealValue ?? 0;
  if (value >= 10_000) return 25;
  if (value >= 1_000) return 15;
  return 0;
}

function recencyBand(lastActivityAt: string | null): number {
  if (!lastActivityAt) return -10;
  const days = (Date.now() - new Date(lastActivityAt).getTime()) / 86_400_000;
  if (days <= 3) return 20;
  if (days <= 7) return 10;
  return -10;
}

export function computeScore(input: {
  status: string;
  deal_value: number | null;
  last_activity_at: string | null;
}): { score: number; confidence: number; factors: ScoreFactors } {
  const status = input.status as LeadStatus;

  if (status === "closed_won") {
    return {
      score: 100,
      confidence: 1,
      factors: { status_weight: 100, deal_value_band: 0, recency_days: 0 },
    };
  }
  if (status === "closed_lost") {
    return {
      score: 0,
      confidence: 1,
      factors: { status_weight: 0, deal_value_band: 0, recency_days: 0 },
    };
  }

  const status_weight = STATUS_WEIGHT[status] ?? STATUS_WEIGHT.new!;
  const deal_value_band = dealValueBand(input.deal_value);
  const recency_days = recencyBand(input.last_activity_at);

  const score = Math.max(
    0,
    Math.min(100, status_weight + deal_value_band + recency_days),
  );

  return {
    score,
    confidence: 0.8,
    factors: { status_weight, deal_value_band, recency_days },
  };
}
