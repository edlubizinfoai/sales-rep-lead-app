export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "closed_won"
  | "closed_lost";

export interface Lead {
  id: string;
  user_id: string | null;
  created_at: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  deal_value: number | null;
  notes: string | null;
  score: number | null;
  score_source: string | null;
  score_confidence: number | null;
  score_review_status: string | null;
  last_activity_at: string | null;
}

export interface Activity {
  id: string;
  user_id: string | null;
  created_at: string;
  lead_id: string;
  activity_type: "call" | "email" | "meeting" | "note";
  notes: string | null;
  occurred_at: string;
}

export interface Subscription {
  id: string;
  user_id: string | null;
  created_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_checkout_session_id: string | null;
  plan: string;
  status: "active" | "canceled" | "past_due";
  current_period_end: string | null;
}

export interface Entitlement {
  isPro: boolean;
  ownLeadCount: number;
  remaining: number;
  limit: number;
}
